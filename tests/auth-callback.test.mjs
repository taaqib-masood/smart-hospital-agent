import assert from "node:assert/strict";
import test from "node:test";
import { loadModule, mockDatabase } from "./mock-module.ts";

for (const existing of [false, true]) {
  test(`auth callback provisions a clinic only when the confirmed user has none (existing=${existing})`, async () => {
    const db = mockDatabase(q => ({ data: q.action === "select" && existing ? { id: "clinic" } : null }));
    const supabase = {
      ...db,
      auth: {
        exchangeCodeForSession: async () => ({ error: null }),
        getUser: async () => ({ data: { user: { id: "user", user_metadata: { clinic_name: "Sunrise Clinic" } } } }),
      },
    };
    const { GET } = loadModule("app/api/auth/callback/route.ts", {
      "next/server": { NextResponse: { redirect: url => ({ redirect: url }) } },
      "@/lib/supabase/server": { createClient: async () => supabase },
      "@/lib/utils": { safeNextPath: () => "/dashboard" },
    });
    const result = await GET({ url: "https://app.test/api/auth/callback?code=abc" });
    assert.deepEqual(result, { redirect: "https://app.test/dashboard" });
    const inserts = db.queries.filter(q => q.action === "insert");
    assert.deepEqual(inserts.map(q => q.value), existing ? [] : [{ owner_id: "user", name: "Sunrise Clinic" }]);
  });
}
