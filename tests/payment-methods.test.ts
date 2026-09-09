import assert from "node:assert/strict";
import test from "node:test";
import { isPaymentMethod } from "../lib/payment-methods.ts";

test("accepts the supported clinic payment methods and rejects Apple Pay", () => {
  assert.equal(isPaymentMethod("Cash"), true);
  assert.equal(isPaymentMethod("Card"), true);
  assert.equal(isPaymentMethod("Tabby"), true);
  assert.equal(isPaymentMethod("Tamara"), true);
  assert.equal(isPaymentMethod("Apple Pay"), false);
  assert.equal(isPaymentMethod("Bank transfer"), false);
});
