import assert from "node:assert/strict";
import test from "node:test";
import { getWhatsAppWindow, WHATSAPP_SERVICE_WINDOW_MS } from "../lib/whatsapp-window.ts";

const inboundAt = "2026-09-11T08:00:00.000Z";
const inboundMs = Date.parse(inboundAt);

test("requires a template when there is no inbound message", () => {
  assert.equal(getWhatsAppWindow(null, inboundMs).isOpen, false);
});

test("keeps free-text messaging open for 24 hours after inbound", () => {
  const state = getWhatsAppWindow(inboundAt, inboundMs + WHATSAPP_SERVICE_WINDOW_MS - 1);
  assert.equal(state.isOpen, true);
  assert.equal(state.remainingSeconds, 1);
  assert.equal(state.closesAt, "2026-09-12T08:00:00.000Z");
});

test("closes the window at exactly 24 hours", () => {
  const state = getWhatsAppWindow(inboundAt, inboundMs + WHATSAPP_SERVICE_WINDOW_MS);
  assert.equal(state.isOpen, false);
  assert.equal(state.remainingSeconds, 0);
});
