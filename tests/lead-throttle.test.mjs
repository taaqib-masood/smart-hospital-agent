import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import { loadModule, mockDatabase } from "./mock-module.ts";

test("direct deployments cannot reset lead limits by rotating forwarding headers", async () => {
  const original = process.env.VERCEL;
  delete process.env.VERCEL;
  try {
    const db = mockDatabase(() => ({ error: null }));
    const { POST } = loadModule("app/api/leads/route.ts", {
      "next/server": { NextResponse: { json: (_body, init) => ({ status: init.status }) } },
      zod: { z }, "@/lib/supabase/admin": { createAdminClient: () => db },
    });
    for (let i = 0; i < 7; i++) {
      const result = await POST(new Request("http://localhost/api/leads", {
        method: "POST", headers: { "x-forwarded-for": String(i), "x-real-ip": String(i) },
        body: JSON.stringify({ name: "Dr Test", email: "a@b.co", clinic: "Clinic", plan: "Clinic Pro" }),
      }));
      assert.equal(result.status, i < 5 ? 201 : 429);
    }
    assert.equal(db.queries.length, 5);
  } finally {
    if (original === undefined) delete process.env.VERCEL; else process.env.VERCEL = original;
  }
});
