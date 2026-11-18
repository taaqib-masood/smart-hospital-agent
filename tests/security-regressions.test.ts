import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getSafeReturnPath } from "../lib/auth-redirect.ts";

test("return paths reject external and normalized authority paths", () => {
  for (const value of [null, "", "https://outside.invalid", "//outside.invalid", "/\\outside.invalid", "/\t/outside.invalid", "/%2foutside.invalid", "/a/..//outside.invalid"]) {
    assert.equal(getSafeReturnPath(value), "/dashboard", String(value));
  }
  assert.equal(getSafeReturnPath("/appointments?day=1#today"), "/appointments?day=1#today");
});

const source = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("all job message updates are clinic scoped", () => {
  const updates = source("app/api/jobs/process/route.ts").split("\n").filter(line => line.includes('from("reva_messages").update'));
  assert.equal(updates.length, 4);
  for (const update of updates) assert.ok(update.includes('.eq("clinic_id", job.clinic_id)'));
});

test("consent and tenant protections remain database enforced", () => {
  assert.match(source("supabase/migrations/202610280003_enforce_clinic_relations.sql"), /foreign key \(patient_id, clinic_id\)/);
  const evidence = source("supabase/migrations/202610280004_protect_consent_evidence.sql");
  assert.match(evidence, /before insert or update/);
  assert.match(evidence, /Completed consent evidence is immutable/);
  assert.match(evidence, /document_hash/);
  assert.match(source("supabase/migrations/202610290005_protect_owner_memberships.sql"), /role <> 'owner'/);
  assert.match(source("supabase/migrations/202610290006_bind_audit_actors.sql"), /actor_user_id = auth.uid\(\)/);
});
