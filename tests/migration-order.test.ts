import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import test from "node:test";

test("Supabase migration versions are unique", () => {
  const versions = readdirSync(new URL("../supabase/migrations/", import.meta.url)).filter(name => name.endsWith(".sql")).map(name => name.split("_")[0]);
  assert.equal(new Set(versions).size, versions.length);
});
