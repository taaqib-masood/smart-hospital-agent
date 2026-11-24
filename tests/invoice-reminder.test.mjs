import assert from "node:assert/strict";
import test from "node:test";
import { loadModule, mockDatabase } from "./mock-module.ts";

test("reminder-only invoice PATCH sends only for outstanding invoices", async () => {
  for (const status of ["Pending", "Paid", "Waived", "failure"]) {
    const db = mockDatabase(q => q.table === "reva_clinics" ? { data: { id: "clinic", name: "Clinic" } } : {
      data: { status, amount: 10, patient: { name: "Patient", phone: "+10000000000" } },
      error: status === "failure" ? { message: "database unavailable" } : null,
    });
    db.auth = { getUser: async () => ({ data: { user: { id: "owner" } } }) };
    let sent = 0;
    const { PATCH } = loadModule("app/api/invoices/[id]/route.ts", {
      "next/server": { NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200 }) } },
      "@/lib/supabase/server": { createClient: async () => db },
      "@/lib/whatsapp-credentials": { getWhatsAppCredentials: async () => ({}) },
      "@/lib/whatsapp": { sendWhatsAppMessage: async () => { sent++; } },
    });
    const result = await PATCH({ json: async () => ({ send_reminder: true }) }, { params: Promise.resolve({ id: "invoice" }) });
    assert.equal(result.status, status === "failure" ? 500 : 200);
    assert.equal(sent, status === "Pending" ? 1 : 0);
    assert.equal(db.queries.filter(q => q.action === "update").length, 0);
  }
});
