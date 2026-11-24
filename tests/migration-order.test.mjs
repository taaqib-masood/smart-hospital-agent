import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

test("Supabase migration versions are unique", () => {
  const versions = readdirSync(new URL("../supabase/migrations/", import.meta.url)).filter(name => name.endsWith(".sql")).map(name => name.split("_")[0]);
  assert.equal(new Set(versions).size, versions.length);
});

test("optional legacy leads table does not block fresh database migrations", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20261118000000_leads_server_only_insert.sql", import.meta.url), "utf8");
  assert.match(sql, /if to_regclass\('public.leads'\) is not null then\s+alter table public.leads enable row level security;\s+revoke insert, update, delete/);
});
