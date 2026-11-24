import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { loadModule, mockDatabase } from "./mock-module.ts";

const clinic = { id: "clinic-a", name: "Clinic A" };
const refs = loadModule("lib/clinic-refs.ts", {});

function route(path) {
  const db = mockDatabase(q => {
    if (q.table === "reva_clinics") return { data: clinic };
    if (q.action === "select" && q.filters.id === "foreign") return { data: null };
    return { data: { id: q.filters.id ?? "row", amount: 10, patient: null } };
  });
  db.auth = { getUser: async () => ({ data: { user: { id: "owner" } } }) };
  const handlers = loadModule(path, {
    "next/server": { NextResponse: { json: (value, init) => ({ value, status: init?.status ?? 200 }) } },
    "@/lib/supabase/server": { createClient: async () => db },
    "@/lib/whatsapp-credentials": { getWhatsAppCredentials: async () => ({ phoneId: null, token: null }) },
    "@/lib/whatsapp": { sendWhatsAppMessage: async () => {} },
    "@/lib/clinic-refs": refs,
  });
  const call = (method, body) => handlers[method]({ json: async () => body }, { params: Promise.resolve({ id: "row" }) });
  const writes = () => db.queries.filter(q => q.action !== "select");
  return { call, writes };
}

test("appointment and invoice creation reject another clinic's patient, doctor or appointment", async () => {
  for (const [path, body] of [
    ["app/api/appointments/route.ts", { patient_id: "foreign", appointment_date: "2026-01-01", appointment_time: "10:00" }],
    ["app/api/appointments/route.ts", { doctor_id: "foreign", appointment_date: "2026-01-01", appointment_time: "10:00" }],
    ["app/api/invoices/route.ts", { patient_id: "foreign", amount: 10 }],
    ["app/api/invoices/route.ts", { appointment_id: "foreign", amount: 10 }],
    ["app/api/invoices/route.ts", { patient_id: { id: "x" }, amount: 10 }],
  ]) {
    const r = route(path);
    assert.equal((await r.call("POST", body)).status, 400, JSON.stringify(body));
    assert.equal(r.writes().length, 0);
  }
});

test("invoice creation writes only named fields with server-set clinic and status", async () => {
  const r = route("app/api/invoices/route.ts");
  const res = await r.call("POST", { patient_id: "p", appointment_id: "a", service_description: "Visit", amount: 10, status: "Paid", clinic_id: "clinic-b", paid_at: "x" });
  assert.equal(res.status, 201);
  const [insert] = r.writes();
  assert.equal(insert.value.clinic_id, "clinic-a");
  assert.equal(insert.value.status, "Pending");
  assert.ok(!("paid_at" in insert.value));
  assert.equal((await route("app/api/invoices/route.ts").call("POST", { amount: -1 })).status, 400);
});

test("invoice update copies only allowlisted fields and never writes send_reminder", async () => {
  const r = route("app/api/invoices/[id]/route.ts");
  await r.call("PATCH", { status: "Paid", amount: 5, clinic_id: "clinic-b", patient_id: "foreign", send_reminder: true });
  const [update] = r.writes();
  assert.deepEqual(Object.keys(update.value).sort(), ["amount", "paid_at", "status"]);
  assert.equal(update.filters.clinic_id, "clinic-a");

  const reminderOnly = route("app/api/invoices/[id]/route.ts");
  assert.equal((await reminderOnly.call("PATCH", { send_reminder: true })).status, 200);
  assert.equal(reminderOnly.writes().length, 0);

  for (const body of [{ status: "Refunded" }, { amount: -1 }, { amount: "5" }]) {
    assert.equal((await route("app/api/invoices/[id]/route.ts").call("PATCH", body)).status, 400, JSON.stringify(body));
  }
});

test("follow-up update writes only a validated status and server-set sent_at", async () => {
  const r = route("app/api/follow-ups/[id]/route.ts");
  await r.call("PATCH", { status: "Sent", clinic_id: "clinic-b", patient_id: "foreign", sent_at: "2000-01-01", template_message: "phish" });
  const [update] = r.writes();
  assert.deepEqual(Object.keys(update.value).sort(), ["sent_at", "status"]);
  assert.notEqual(update.value.sent_at, "2000-01-01");

  const skipped = route("app/api/follow-ups/[id]/route.ts");
  await skipped.call("PATCH", { status: "Skipped" });
  assert.deepEqual(skipped.writes()[0].value, { status: "Skipped" });

  assert.equal((await route("app/api/follow-ups/[id]/route.ts").call("PATCH", { clinic_id: "clinic-b" })).status, 400);
});

test("schema ties child rows to their clinic", () => {
  const sql = readFileSync(new URL("../supabase/migrations/202611180001_enforce_clinic_relations.sql", import.meta.url), "utf8");
  for (const fk of ["reva_appointments_patient_id_fkey", "reva_appointments_doctor_id_fkey", "reva_invoices_patient_id_fkey", "reva_invoices_appointment_id_fkey", "reva_follow_ups_patient_id_fkey", "reva_follow_ups_appointment_id_fkey"]) {
    assert.match(sql, new RegExp(`add constraint ${fk} foreign key \\(\\w+, clinic_id\\)`));
  }
});
