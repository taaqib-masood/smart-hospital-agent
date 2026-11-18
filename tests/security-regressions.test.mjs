import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { safeNextPath } from "../lib/utils.ts";

test("return paths reject external and normalized authority paths", () => {
  for (const value of [null, "", "https://outside.invalid", "//outside.invalid", "/\\outside.invalid", "/\t/outside.invalid", "/%2foutside.invalid", "/a/..//outside.invalid"]) {
    assert.equal(safeNextPath(value), "/dashboard", String(value));
  }
  assert.equal(safeNextPath("/appointments?day=1#today"), "/appointments?day=1#today");
});

const source = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("logout awaits session revocation before navigation", () => {
  const dashboard = source("app/dashboard/page.tsx");
  assert.match(dashboard, /await createClient\(\).auth.signOut\(\)/);
  assert.match(dashboard, /if \(error\) throw error/);
  assert.match(dashboard, /window.location.replace\("\/login"\)/);
});

test("WhatsApp transport never uses deployment credentials", () => {
  assert.doesNotMatch(source("lib/whatsapp.ts"), /process.env.WHATSAPP_(PHONE_ID|TOKEN)/);
});

test("clinic PATCH only writes allowlisted profile fields", async () => {
  const { loadModule, mockDatabase } = await import("./mock-module.ts");
  const db = mockDatabase(() => ({ data: {} }));
  db.auth = { getUser: async () => ({ data: { user: { id: "owner" } } }) };
  const { PATCH } = loadModule("app/api/clinic/route.ts", {
    "next/server": { NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200 }) } },
    "@/lib/supabase/server": { createClient: async () => db },
  });
  const patch = body => PATCH({ json: async () => body });
  assert.equal((await patch({ name: "Acme", whatsapp_phone_id: "x", whatsapp_token: "t", owner_id: "other", id: "c2", created_at: "x" })).status, 200);
  const { updated_at, ...written } = db.queries.at(-1).value;
  assert.deepEqual(written, { name: "Acme" });
  assert.ok(updated_at);
  assert.equal(db.queries.at(-1).filters.owner_id, "owner");
  for (const bad of [0, 169, 1.5, "24"]) assert.equal((await patch({ reminder_hours_before: bad })).status, 400, String(bad));
  assert.equal((await patch([])).status, 400);
});
