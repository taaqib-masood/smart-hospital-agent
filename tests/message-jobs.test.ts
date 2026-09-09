import assert from "node:assert/strict";
import test from "node:test";
import { retryDelaySeconds } from "../lib/message-jobs.ts";

test("message retries back off exponentially and cap at one hour", () => {
  assert.deepEqual([1, 2, 3, 4, 5].map(retryDelaySeconds), [60, 120, 240, 480, 960]);
  assert.equal(retryDelaySeconds(20), 3600);
});
