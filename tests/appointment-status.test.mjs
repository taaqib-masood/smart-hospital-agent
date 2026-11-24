import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

test("status changes announce success only after persistence, and keep the old state on conflict", async () => {
  const source = readFileSync(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8");
  const handler = source.slice(source.indexOf("  const updateStatus ="), source.indexOf("  const sendReminder ="));
  const code = ts.transpileModule(handler, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText;
  for (const failure of [false, true]) {
    let state = [{ _id: "appointment", status: "Cancelled" }];
    const toasts = [];
    let persisted = false;
    const update = new Function("appts", "setAppts", "setExpandedIdx", "addToast", "updateAppointment", "refresh", code + "; return updateStatus;")(
      state, fn => { assert.ok(persisted); state = fn(state); }, () => {}, (...args) => toasts.push(args),
      async () => { if (failure) throw new Error("Slot already booked"); persisted = true; }, () => {},
    );
    await update(0, "Confirmed");
    assert.equal(state[0].status, failure ? "Cancelled" : "Confirmed");
    assert.equal(toasts.length, 1);
    assert.equal(toasts[0][1], failure ? "warn" : "success");
  }
});
