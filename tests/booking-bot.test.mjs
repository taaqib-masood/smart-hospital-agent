import assert from "node:assert/strict";
import test from "node:test";
import { loadModule, mockDatabase } from "./mock-module.ts";

const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const clinic = { id: "clinic", name: "Clinic", reminder_hours_before: 2 };

function bot({ insertError = null, upcoming = null } = {}) {
  let stateRow = { state: "booked", expires_at: new Date(Date.now() + 600000).toISOString(), context: {
    patient_name: "Mallory", patient_id: "patient", selected_doctor_id: "doctor", selected_doctor_name: "Dr. Bob", selected_date: date, selected_time: "09:15",
  } };
  const db = mockDatabase(q => {
    if (q.table === "reva_booking_state" && q.action === "upsert") { stateRow = { ...q.value }; return { data: null }; }
    if (q.table === "reva_booking_state") return { data: stateRow };
    if (q.table === "reva_doctors") return { data: { slot_duration_minutes: 15 } };
    if (q.table === "reva_patients") return { data: { id: "patient" } };
    if (q.table === "reva_appointments" && q.action === "insert") return { data: null, error: insertError };
    if (q.table === "reva_appointments" && q.action === "update") return { data: null, error: null };
    if (q.table === "reva_appointments" && q.filters.patient_id) return { data: upcoming };
    return { data: [{ appointment_time: "09:00:00" }] };
  });
  const replies = [];
  const { handleBotMessage } = loadModule("lib/booking-bot.ts", {
    "@/lib/supabase/admin": { createAdminClient: () => db },
    "@/lib/whatsapp": { sendWhatsAppMessage: async (_to, text) => { replies.push(text); } },
    "@/lib/utils": { formatDate: d => d, formatTime: t => t },
  });
  return { db, replies, send: text => handleBotMessage(clinic, "+10000000000", text, "wamid"), state: () => stateRow };
}

const inserts = db => db.queries.filter(q => q.table === "reva_appointments" && q.action === "insert");

test("typed time cannot bypass offered slots: 'change 09:00' then 'yes' books nothing", async () => {
  const { db, replies, send } = bot();
  await send("change 09:00");
  await send("yes");
  assert.equal(inserts(db).length, 0);
  assert.ok(!replies.some(r => r.includes("Booked")));
});

test("confirming a slot taken since it was offered replies unavailable and books nothing", async () => {
  const { db, replies, send, state } = bot();
  state().context.selected_time = "09:00";
  await send("yes");
  assert.equal(inserts(db).length, 0);
  assert.match(replies.at(-1), /no longer available/);
  assert.equal(state().state, "show_slots");
});

test("free slot books once; insert errors never reply Booked", async () => {
  const ok = bot();
  await ok.send("yes");
  assert.equal(inserts(ok.db).length, 1);
  assert.match(ok.replies.at(-1), /Booked/);

  for (const code of ["23505", "XX000"]) {
    const failed = bot({ insertError: { code } });
    await failed.send("yes");
    assert.ok(!failed.replies.some(r => r.includes("Booked")), code);
  }
});

test("free-form cancellation messages require explicit CANCEL confirmation", async () => {
  for (const text of ["Please don't cancel my appointment", "Please don’t cancel my appointment", "Do not cancel my appointment", "I do not want to cancel", "Cancel is not what I want", "Please refrain from cancelling", "Cancel my appointment"]) {
    const idle = bot({ upcoming: { id: "appt" } });
    idle.state().state = "idle";
    await idle.send(text);
    assert.equal(idle.db.queries.filter(q => q.action === "update").length, 0);
    assert.match(idle.replies.at(-1), /not cancelled anything/);
  }
});

test("cancel only claims a cancellation when a real appointment was cancelled", async () => {
  const midFlow = bot({ upcoming: { id: "appt" } });
  await midFlow.send("cancel");
  assert.equal(midFlow.db.queries.filter(q => q.action === "update").length, 0);
  assert.match(midFlow.replies.at(-1), /existing appointment remains scheduled/);

  for (const upcoming of [null, { id: "appt" }]) {
    const idle = bot({ upcoming });
    idle.state().state = "idle";
    await idle.send("cancel");
    const updates = idle.db.queries.filter(q => q.table === "reva_appointments" && q.action === "update");
    assert.equal(updates.length, upcoming ? 1 : 0);
    assert.match(idle.replies.at(-1), upcoming ? /has been cancelled/ : /couldn't find/);
    const query = idle.db.queries.find(q => q.table === "reva_appointments" && q.action === "select");
    assert.match(query.filters.or, /^appointment_date.gt.\d{4}-\d{2}-\d{2},and\(appointment_date.eq.\d{4}-\d{2}-\d{2},appointment_time.gte.\d{2}:\d{2}:\d{2}\)$/);
  }
});
