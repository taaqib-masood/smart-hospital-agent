import assert from "node:assert/strict";
import test from "node:test";
import { normalizePhone } from "../lib/whatsapp.ts";

test("preserves provider country codes without merging international sender identities", () => {
  const senders = ["6585123456", "971585123456", "585123456"];
  assert.deepEqual(senders.map(normalizePhone), senders.map(phone => `+${phone}`));
  assert.equal(new Set(senders.map(normalizePhone)).size, senders.length);
  assert.equal(normalizePhone("+971 58-512-3456"), "+971585123456");
  assert.equal(normalizePhone("919876543210"), "+919876543210");
});
