import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { verifyMetaWebhookSignature } from "../lib/security.ts";

test("accepts only the matching Meta webhook signature", () => {
  const body = JSON.stringify({ object: "whatsapp_business_account", entry: [] });
  const secret = "test-secret";
  const signature = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;

  assert.equal(verifyMetaWebhookSignature(body, signature, secret), true);
  assert.equal(verifyMetaWebhookSignature(`${body}x`, signature, secret), false);
  assert.equal(verifyMetaWebhookSignature(body, null, secret), false);
  assert.equal(verifyMetaWebhookSignature(body, "sha256=bad", secret), false);
  assert.equal(verifyMetaWebhookSignature(body, `sha256=${"z".repeat(64)}`, secret), false);
});
