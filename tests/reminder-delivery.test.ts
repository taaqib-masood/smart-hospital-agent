import assert from "node:assert/strict";
import test from "node:test";
import { loadModule, mockDatabase } from "./mock-module.ts";

for (const doctorActive of [false, true]) {
  test(`booking confirmation rechecks an active practitioner (active=${doctorActive})`, async () => {
    const context = { selected_doctor_id: "doctor", selected_date: "2030-01-01", selected_time: "09:00", patient_id: "patient" };
    const db = mockDatabase(q => {
      if (q.table === "reva_booking_state" && q.action === "select") return { data: { state: "booked", context, expires_at: "2099-01-01" } };
      if (q.table === "reva_doctors") {
        assert.deepEqual(q.filters, { id: "doctor", clinic_id: "clinic", active: true });
        return { data: doctorActive ? { slot_duration_minutes: 30 } : null };
      }
      if (q.table === "reva_appointments" && q.action === "insert") return { data: { id: "appointment" } };
      return { data: null };
    });
    const replies: string[] = [];
    let availabilityChecks = 0;
    const { handleBotMessage } = loadModule("lib/booking-bot.ts", {
      "@/lib/supabase/admin": { createAdminClient: () => db },
      "@/lib/whatsapp": { sendWhatsAppMessage: async (_phone: string, text: string) => { replies.push(text); return {}; } },
      "@/lib/utils": { formatDate: String, formatTime: String },
      "@/lib/availability": { getAvailableSlots: async () => { availabilityChecks++; return ["09:00"]; } },
    });
    await handleBotMessage({ id: "clinic", name: "Clinic" }, "+10000000000", "YES", "message");
    assert.equal(availabilityChecks, doctorActive ? 1 : 0);
    assert.equal(db.queries.filter(q => q.table === "reva_appointments" && q.action === "insert").length, doctorActive ? 1 : 0);
    assert.match(replies[0], doctorActive ? /Booked/ : /no longer available/);
    const saved = db.queries.find(q => q.table === "reva_booking_state" && q.action === "upsert")?.value as { state: string; context: typeof context };
    assert.equal(saved.state, doctorActive ? "idle" : "show_slots");
    if (!doctorActive) assert.equal(saved.context.selected_time, undefined);
  });
}

test("an invalid clinic timezone or reminder duration does not abort healthy clinics", async () => {
  const target = new Date(Date.now() + 24 * 3600000);
  const db = mockDatabase(q => {
    if (q.table === "reva_clinics") return { data: [
      { id: "bad-timezone", timezone: "Invalid/Zone" },
      { id: "bad-duration", timezone: "UTC", reminder_hours_before: "invalid" },
      { id: "healthy", timezone: "UTC" },
    ] };
    if (q.table === "reva_whatsapp_templates") return { data: { template_name: "reminder", language_code: "en" } };
    if (q.table === "reva_appointments") return { data: [{
      id: "appointment", appointment_date: target.toISOString().slice(0, 10), appointment_time: target.toISOString().slice(11, 16),
      patient_id: "patient", patient: { clinic_id: "healthy", name: "Patient", phone: "+10000000000" },
    }] };
    if (q.table === "reva_message_jobs") return { error: null };
    return { data: [] };
  });
  const { GET } = loadModule("app/api/reminders/route.ts", {
    "next/server": { NextResponse: { json: (value: unknown) => value } },
    "@/lib/supabase/admin": { createAdminClient: () => db },
  });
  process.env.CRON_SECRET = "local-regression-secret";
  const result = await GET({ headers: new Headers({ authorization: "Bearer local-regression-secret" }) });
  assert.deepEqual(result, { appointment_reminders: { queued: 1, skipped: 2 }, follow_ups: { materialized: 0, queued: 0, skipped: 0 } });
  const jobs = db.queries.filter(q => q.table === "reva_message_jobs");
  assert.equal(jobs.length, 1);
  assert.equal((jobs[0].value as { clinic_id: string }).clinic_id, "healthy");
});
