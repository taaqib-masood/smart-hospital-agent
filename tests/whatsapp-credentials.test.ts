import assert from "node:assert/strict";
import test from "node:test";
import { resolveWhatsAppCredentials } from "../lib/whatsapp-credentials.ts";

test("stored clinic credentials take precedence over the environment fallback", () => {
  const originalPhoneId = process.env.WHATSAPP_PHONE_ID;
  const originalToken = process.env.WHATSAPP_TOKEN;
  process.env.WHATSAPP_PHONE_ID = "environment-phone";
  process.env.WHATSAPP_TOKEN = "environment-token";

  assert.deepEqual(resolveWhatsAppCredentials({ phone_id: "clinic-phone", access_token: "clinic-token" }), {
    phoneId: "clinic-phone",
    token: "clinic-token",
  });
  assert.deepEqual(resolveWhatsAppCredentials(null), {
    phoneId: "environment-phone",
    token: "environment-token",
  });

  if (originalPhoneId === undefined) delete process.env.WHATSAPP_PHONE_ID;
  else process.env.WHATSAPP_PHONE_ID = originalPhoneId;
  if (originalToken === undefined) delete process.env.WHATSAPP_TOKEN;
  else process.env.WHATSAPP_TOKEN = originalToken;
});
