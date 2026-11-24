import assert from "node:assert/strict";
import test from "node:test";
import { loadModule, mockDatabase } from "./mock-module.ts";

test("clinic PATCH accepts valid reminder intervals and persists them for the owner", async () => {
  const db = mockDatabase(() => ({ data: { id: "clinic" } }));
  db.auth = { getUser: async () => ({ data: { user: { id: "owner" } } }) };
  const { PATCH } = loadModule("app/api/clinic/route.ts", {
    "next/server": { NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200 }) } },
    "@/lib/supabase/server": { createClient: async () => db },
  });
  for (const reminder_hours_before of [1, 24, 168]) {
    const result = await PATCH({ json: async () => ({ reminder_hours_before }) });
    assert.equal(result.status, 200);
  }
  const writes = db.queries.filter(q => q.action === "update");
  assert.deepEqual(writes.map(q => q.value.reminder_hours_before), [1, 24, 168]);
  assert.ok(writes.every(q => q.filters.owner_id === "owner"));
});
