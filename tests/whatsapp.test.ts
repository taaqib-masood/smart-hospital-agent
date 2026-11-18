import assert from "node:assert/strict";
import test from "node:test";
import { markMessageRead, normalizePhone, sendWhatsAppMessage, sendWhatsAppTemplate } from "../lib/whatsapp.ts";

test("preserves provider country codes without merging international sender identities", () => {
  const senders = ["6585123456", "971585123456", "585123456"];
  assert.deepEqual(senders.map(normalizePhone), senders.map(phone => `+${phone}`));
  assert.equal(new Set(senders.map(normalizePhone)).size, senders.length);
  assert.equal(normalizePhone("+971 58-512-3456"), "+971585123456");
  assert.equal(normalizePhone("919876543210"), "+919876543210");
});

test("never substitutes environment credentials for a missing explicit sender pair", async t => {
  const originalPhoneId = process.env.WHATSAPP_PHONE_ID;
  const originalToken = process.env.WHATSAPP_TOKEN;
  process.env.WHATSAPP_PHONE_ID = "environment-phone";
  process.env.WHATSAPP_TOKEN = "environment-token";
  const request = t.mock.method(globalThis, "fetch", async () => Response.json({ messages: [{ id: "unexpected" }] }));

  try {
    const pairs: Array<[string | null, string | null]> = [
      [null, null], ["clinic-phone", null], [null, "clinic-token"], ["", "clinic-token"], ["clinic-phone", ""],
    ];
    for (const [phoneId, token] of pairs) {
      await assert.rejects(sendWhatsAppMessage("+6585123456", "Hello", phoneId, token), /credentials not configured/);
      await assert.rejects(sendWhatsAppTemplate("+6585123456", "reminder", "en", [], phoneId, token), /credentials not configured/);
      await markMessageRead("inbound-message", phoneId, token);
    }
    assert.equal(request.mock.callCount(), 0);
  } finally {
    if (originalPhoneId === undefined) delete process.env.WHATSAPP_PHONE_ID;
    else process.env.WHATSAPP_PHONE_ID = originalPhoneId;
    if (originalToken === undefined) delete process.env.WHATSAPP_TOKEN;
    else process.env.WHATSAPP_TOKEN = originalToken;
  }
});

test("uses the explicit clinic pair for text, template, and read-receipt requests", async t => {
  const requests: Array<{ url: string; init: RequestInit | undefined }> = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
    requests.push({ url: String(input), init });
    return Response.json({ messages: [{ id: "outbound-message" }] });
  });

  await sendWhatsAppMessage("+6585123456", "Hello", "clinic-phone", "clinic-token");
  await sendWhatsAppTemplate("+6585123456", "reminder", "en", [], "clinic-phone", "clinic-token");
  await markMessageRead("inbound-message", "clinic-phone", "clinic-token");

  assert.equal(requests.length, 3);
  for (const { url, init } of requests) {
    assert.equal(url, "https://graph.facebook.com/v19.0/clinic-phone/messages");
    assert.equal(new Headers(init?.headers).get("authorization"), "Bearer clinic-token");
  }
});

test("keeps provider error handling for text and template sends", async t => {
  t.mock.method(globalThis, "fetch", async () => new Response("provider failure", { status: 502 }));
  await assert.rejects(sendWhatsAppMessage("+6585123456", "Hello", "clinic-phone", "clinic-token"), /WhatsApp API error 502: provider failure/);
  await assert.rejects(sendWhatsAppTemplate("+6585123456", "reminder", "en", [], "clinic-phone", "clinic-token"), /WhatsApp API error 502: provider failure/);
});
