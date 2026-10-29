// Self-check for safeNextPath (open-redirect guard). Run: node lib/utils.test.mjs
import assert from "node:assert/strict";
import { safeNextPath } from "./utils.ts";

// same-site paths pass through
assert.equal(safeNextPath("/dashboard"), "/dashboard");
assert.equal(safeNextPath("/dashboard/patients?tab=queue"), "/dashboard/patients?tab=queue");
assert.equal(safeNextPath(null), "/dashboard");
assert.equal(safeNextPath(""), "/dashboard");

// external / protocol-relative / scheme tricks fall back
assert.equal(safeNextPath("https://evil.example/login"), "/dashboard");
assert.equal(safeNextPath("//evil.example"), "/dashboard");
assert.equal(safeNextPath("/\\evil.example"), "/dashboard");
assert.equal(safeNextPath("/@evil.example"), "/dashboard");
assert.equal(safeNextPath("javascript:alert(1)"), "/dashboard");
assert.equal(safeNextPath("dashboard"), "/dashboard");

console.log("safeNextPath: all checks passed");
