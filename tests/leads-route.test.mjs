import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { loadModule, mockDatabase } from "./mock-module.ts";

const require = createRequire(import.meta.url);
const lead = { name: "Dr Test", email: "a@b.co", clinic: "Clinic", plan: "Clinic Pro" };

function load(insertError) {
  const db = mockDatabase(() => ({ error: insertError }));
  const { POST } = loadModule("app/api/leads/route.ts", {
    "next/server": { NextResponse: { json: (body, init) => ({ body, status: init?.status }) } },
    zod: require("zod"),
    "@/lib/supabase/admin": { createAdminClient: () => db },
  });
  return { db, POST };
}

const post = (POST, body, ip) => POST(new Request("http://x/api/leads", {
  method: "POST", headers: { "x-forwarded-for": ip }, body: JSON.stringify(body),
}));

test("leads route rejects plans outside the enum without writing", async () => {
  const { db, POST } = load(null);
  assert.equal((await post(POST, { ...lead, plan: "x".repeat(1_000_000) }, "1.1.1.1")).status, 400);
  assert.equal(db.queries.length, 0);
});

test("leads route reports insert failures instead of fake success", async () => {
  assert.equal((await post(load(null).POST, lead, "2.2.2.2")).status, 201);
  assert.equal((await post(load({ message: "denied" }).POST, lead, "3.3.3.3")).status, 500);
});
