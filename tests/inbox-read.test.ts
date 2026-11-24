import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("inbox refreshes after a successful read or a missing-conversation rejection", async () => {
  const source = readFileSync(new URL("../components/MessagesView.tsx", import.meta.url), "utf8");
  const expression = source.match(/markConversationRead\(c\._realId\)\.then\([^;]+\)/)?.[0];
  assert.ok(expression);
  const click = new Function("markConversationRead", "refresh", "c", "return " + expression);
  for (const missing of [false, true]) {
    let refreshed = 0;
    await click(() => missing ? Promise.reject(new Error("404")) : Promise.resolve(), () => { refreshed++; }, { _realId: "conversation" });
    assert.equal(refreshed, 1);
  }
});
