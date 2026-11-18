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
