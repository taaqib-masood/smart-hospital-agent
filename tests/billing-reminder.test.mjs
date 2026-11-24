import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("the disconnected dashboard reminder action never claims delivery", () => {
  const source = readFileSync(new URL("../components/BillingView.tsx", import.meta.url), "utf8");
  const handler = source.match(/const sendAllReminders = \(\) => \{([\s\S]*?)\n  \};/)?.[1];
  assert.ok(handler);
  const notices = [];
  new Function("addToast", handler)((...args) => notices.push(args));
  assert.deepEqual(notices, [["Payment reminders are not connected in this dashboard. No messages were sent.", "warn"]]);
});
