import assert from "node:assert/strict";
import test from "node:test";
import { loadModule, mockDatabase } from "./mock-module.ts";

for (const owned of [true, false]) {
  test(`mark-as-read is scoped to the caller's clinic (owned=${owned})`, async () => {
    const db = mockDatabase(q => q.table === "reva_clinics"
      ? { data: { id: "clinic-a" } }
      : { data: owned ? [{ id: "conv" }] : [], error: null });
    db.auth = { getUser: async () => ({ data: { user: { id: "owner-a" } } }) };
    const { POST } = loadModule("app/api/conversations/[id]/read/route.ts", {
      "next/server": { NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200 }) } },
      "@/lib/supabase/server": { createClient: async () => db },
    });
    const res = await POST({}, { params: Promise.resolve({ id: "conv" }) });
    const update = db.queries.find(q => q.action === "update");
    assert.deepEqual(update.filters, { id: "conv", clinic_id: "clinic-a" });
    assert.equal(res.status, owned ? 200 : 404);
  });
}
