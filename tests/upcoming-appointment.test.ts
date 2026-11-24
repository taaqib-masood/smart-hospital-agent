import assert from "node:assert/strict";
import test from "node:test";
import { loadModule, mockDatabase } from "./mock-module.ts";

test("invalid stored timezones give cancellation and rescheduling instructions without changing appointments", async () => {
  for (const timezone of ["Invalid/Timezone", ""]) {
    for (const intent of ["CANCEL", "reschedule"]) {
      const db = mockDatabase(q => ({ data: q.table === "reva_patients" ? { id: "patient" } : null }));
      const replies: string[] = [];
      const { handleBotMessage } = loadModule("lib/booking-bot.ts", {
        "@/lib/supabase/admin": { createAdminClient: () => db },
        "@/lib/whatsapp": { sendWhatsAppMessage: async (_phone: string, text: string) => { replies.push(text); } },
        "@/lib/utils": { formatDate: String, formatTime: String },
        "@/lib/availability": { getAvailableSlots: async () => [] },
      });
      await handleBotMessage({ id: "clinic", name: "Clinic", timezone }, "+10000000000", intent, "message");
      assert.equal(replies.length, 1);
      assert.match(replies[0], /No appointment has been changed.*Please contact the clinic/);
      assert.ok(db.queries.every(q => q.action === "select"));
      assert.equal(db.queries.filter(q => q.table === "reva_appointments").length, 0);
    }
  }
});

test("cancellation and rescheduling skip elapsed appointments in the clinic timezone", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2030-01-01T21:30:00Z") });
  for (const timezone of ["Asia/Dubai", "America/New_York"]) {
    for (const scenario of ["ok", "empty", "failure", "no-patient", "reschedule"]) {
      const date = timezone === "Asia/Dubai" ? "2030-01-02" : "2030-01-01";
      const time = timezone === "Asia/Dubai" ? "01:30:00" : "16:30:00";
      const db = mockDatabase(q => {
        if (q.table === "reva_patients") return { data: scenario === "no-patient" ? null : { id: "patient" } };
        if (q.table === "reva_appointments" && q.action === "select") {
          assert.equal(q.filters.or, `appointment_date.gt.${date},and(appointment_date.eq.${date},appointment_time.gte.${time})`);
          return { data: ["empty", "failure"].includes(scenario) ? null : { id: "future", doctor_id: "doctor", patient_id: "patient" }, error: scenario === "failure" ? { message: "unavailable" } : null };
        }
        return { data: null };
      });
      const replies: string[] = [];
      const { handleBotMessage } = loadModule("lib/booking-bot.ts", {
        "@/lib/supabase/admin": { createAdminClient: () => db },
        "@/lib/whatsapp": { sendWhatsAppMessage: async (_phone: string, text: string) => { replies.push(text); } },
        "@/lib/utils": { formatDate: String, formatTime: String },
        "@/lib/availability": { getAvailableSlots: async () => [] },
      });
      await handleBotMessage({ id: "clinic", name: "Clinic", timezone }, "+10000000000", scenario === "reschedule" ? "reschedule" : "CANCEL", "message");
      const lookups = db.queries.filter(q => q.table === "reva_appointments" && q.action === "select");
      assert.equal(lookups.length, scenario === "no-patient" ? 0 : 1);
      if (scenario === "reschedule") {
        const saved = db.queries.find(q => q.table === "reva_booking_state" && q.action === "upsert")?.value as { state: string; context: { reschedule_appointment_id: string } } | undefined;
        assert.equal(saved?.state, "show_slots");
        assert.equal(saved?.context.reschedule_appointment_id, "future");
        assert.match(replies.at(-1) ?? "", /choose a new date/);
      }
      const updates = db.queries.filter(q => q.table === "reva_appointments" && q.action === "update");
      assert.equal(updates.length, scenario === "ok" ? 1 : 0);
      if (scenario === "ok") assert.equal(updates[0].filters.id, "future");
      else assert.ok(!replies.some(reply => reply.includes("has been cancelled")));
    }
  }
});
