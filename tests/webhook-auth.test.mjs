import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { loadModule, mockDatabase } from "./mock-module.ts";

test("service-role webhook requires a valid signature and scopes status updates", async () => {
  process.env.WHATSAPP_APP_SECRET = "local-test-secret";
  const db = mockDatabase(q => ({ data: q.table === "reva_clinics" ? { id: "clinic" } : null }));
  const { POST } = loadModule("app/api/whatsapp/webhook/route.ts", {
    "next/server": { NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200 }) } },
    "@/lib/supabase/admin": { createAdminClient: () => db },
    "@/lib/whatsapp-credentials": {}, "@/lib/booking-bot": {}, "@/lib/whatsapp": {},
  });
  const body = JSON.stringify({ entry: [{ changes: [{ value: { metadata: { phone_number_id: "phone" }, statuses: [{ id: "message", status: "read" }] } }] }] });
  for (const signature of ["", "sha256=bad", `sha256=${createHmac("sha256", "local-test-secret").update(body).digest("hex")}`]) {
    const result = await POST(new Request("http://localhost/api/whatsapp/webhook", { method: "POST", headers: { "x-hub-signature-256": signature }, body }));
    assert.equal(result.status, signature.length > 20 ? 200 : 401);
  }
  assert.deepEqual(db.queries.find(q => q.action === "update").filters, { wa_message_id: "message", clinic_id: "clinic" });
  const queryCount = db.queries.length;
  for (const raw of ["{", "", "null", "{}"] ) {
    const signature = `sha256=${createHmac("sha256", "local-test-secret").update(raw).digest("hex")}`;
    const result = await POST(new Request("http://localhost/api/whatsapp/webhook", { method: "POST", headers: { "x-hub-signature-256": signature }, body: raw }));
    assert.equal(result.status, 200);
  }
  assert.equal(db.queries.length, queryCount);
});
