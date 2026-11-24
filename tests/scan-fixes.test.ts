import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { z } from "zod";
import { loadModule, mockDatabase } from "./mock-module.ts";

const json = (body: unknown, init?: { status: number }) => ({ body, status: init?.status ?? 200 });
const access = { userId: "owner", clinicId: "clinic", role: "admin" };

test("leads validate plans and report both successful and failed inserts", async () => {
  for (const scenario of ["invalid", "empty", "ok", "failure"]) {
    const db = mockDatabase(() => ({ error: scenario === "failure" ? { message: "denied" } : null }));
    const { POST } = loadModule("app/api/leads/route.ts", {
      "next/server": { NextResponse: { json } }, zod: { z },
      "@/lib/supabase/admin": { createAdminClient: () => db },
    });
    const body = scenario === "empty" ? {} : { name: "Dr Test", email: "a@b.co", clinic: "Clinic", plan: scenario === "invalid" ? "x".repeat(1000000) : "Clinic Pro" };
    const result = await POST(new Request("http://localhost/api/leads", { method: "POST", body: JSON.stringify(body) })) as { status: number };
    assert.equal(result.status, scenario === "ok" ? 201 : scenario === "failure" ? 500 : 400);
    assert.equal(db.queries.length, ["ok", "failure"].includes(scenario) ? 1 : 0);
  }
});

test("clinic PATCH preserves its allowlist and validates reminder hours and body", async () => {
  const db = mockDatabase(() => ({ data: {} }));
  const { PATCH } = loadModule("app/api/clinic/route.ts", {
    "next/server": { NextResponse: { json } },
    "@/lib/supabase/server": { createClient: async () => db },
    "@/lib/auth": { getClinicAccess: async () => access },
  });
  for (const body of [null, [], {}, { name: "Clinic", whatsapp_phone_id: "other", whatsapp_token: "secret", owner_id: "other", id: "other" }, ...[0, 169, 1.5, "24"].map(reminder_hours_before => ({ reminder_hours_before }))]) {
    const invalid = body === null || Array.isArray(body) || "reminder_hours_before" in body;
    const result = await PATCH({ json: async () => body }) as { status: number };
    assert.equal(result.status, invalid ? 400 : 200);
  }
  const writes = db.queries.filter(q => q.table === "reva_clinics" && q.action === "update");
  assert.deepEqual(writes.map(q => q.value), [{}, { name: "Clinic" }]);
  assert.ok(writes.every(q => q.filters.id === "clinic"));
});

test("mark-as-read is scoped and returns 404 for absent or foreign conversations", async () => {
  for (const owned of [true, false]) {
    const db = mockDatabase(() => ({ data: owned ? [{ id: "conversation" }] : [] }));
    const { POST } = loadModule("app/api/conversations/[id]/read/route.ts", {
      "next/server": { NextResponse: { json } },
      "@/lib/supabase/server": { createClient: async () => db },
      "@/lib/auth": { getClinicAccess: async () => access },
    });
    const result = await POST({}, { params: Promise.resolve({ id: "conversation" }) }) as { status: number };
    assert.equal(result.status, owned ? 200 : 404);
    assert.deepEqual(db.queries[0].filters, { id: "conversation", clinic_id: "clinic" });
  }
});

test("cancel stops an in-progress booking and never reports a failed update as cancelled", async () => {
  for (const scenario of ["midflow", "reschedule", "empty", "ok", "failure"]) {
    const db = mockDatabase(q => {
      if (q.table === "reva_booking_state" && q.action === "select") return { data: { state: scenario === "reschedule" ? "show_slots" : scenario === "midflow" ? "booked" : "idle", context: { reschedule_appointment_id: scenario === "reschedule" ? "appointment" : undefined }, expires_at: "2099-01-01" } };
      if (q.table === "reva_patients") return { data: { id: "patient" } };
      if (q.table === "reva_appointments") return { data: scenario === "empty" ? null : { id: "appointment" }, error: q.action === "update" && scenario === "failure" ? { message: "failed" } : null };
      return { data: null };
    });
    const replies: string[] = [];
    const { handleBotMessage } = loadModule("lib/booking-bot.ts", {
      "@/lib/supabase/admin": { createAdminClient: () => db },
      "@/lib/whatsapp": { sendWhatsAppMessage: async (_phone: string, text: string) => { replies.push(text); return {}; } },
      "@/lib/utils": { formatDate: String, formatTime: String },
      "@/lib/availability": { getAvailableSlots: async () => [] },
    });
    await handleBotMessage({ id: "clinic", name: "Clinic" }, "+10000000000", "CANCEL", "message");
    assert.match(replies.at(-1) ?? "", ["midflow", "reschedule"].includes(scenario) ? /existing appointment remains scheduled/ : scenario === "failure" ? /couldn't cancel/ : scenario === "ok" ? /has been cancelled/ : /could not find/);
    assert.equal(db.queries.filter(q => q.table === "reva_appointments" && q.action === "update").length, ["ok", "failure"].includes(scenario) ? 1 : 0);
  }
});

test("clinic routing fields cannot be written directly and anon grants are retired", () => {
  const migration = readFileSync(new URL("../supabase/migrations/202611180001_lock_clinic_routing_columns.sql", import.meta.url), "utf8");
  assert.match(migration, /revoke insert, update/);
  assert.doesNotMatch(migration, /grant (insert|update) \([^)]*(whatsapp_phone_id|whatsapp_token)/);
  assert.match(readFileSync(new URL("../supabase/migrations/20261118000200_revoke_anon_reva_access.sql", import.meta.url), "utf8"), /revoke all on table/);
});
