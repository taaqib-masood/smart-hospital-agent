import assert from "node:assert/strict";
import test from "node:test";
import { generateSlotsFromWindows } from "../lib/availability.ts";

test("generates only complete unblocked appointment slots", () => {
  assert.deepEqual(
    generateSlotsFromWindows(
      [{ start: "09:00", end: "10:30" }],
      30,
      ["09:30:00"],
      [{ start: "10:15", end: "10:45" }],
    ),
    ["09:00"],
  );
});
