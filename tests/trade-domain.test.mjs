import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateEconomics,
  summarizeDesk,
  withinOneCent,
} from "../app/trade-capture/domain/calculations.ts";

test("calculates current face, principal, and signed exposure", () => {
  assert.deepEqual(calculateEconomics(1_000_000, 0.8, 99.5, "buy"), {
    currentFace: 800_000,
    grossPrincipal: 796_000,
    signedExposure: 796_000,
  });
  assert.equal(calculateEconomics(1_000_000, 0.8, 99.5, "sell").signedExposure, -796_000);
});

test("uses rounded cents for allocation tolerance", () => {
  assert.equal(withinOneCent(100, 100.01), true);
  assert.equal(withinOneCent(100, 100.02), false);
});

test("summarizes an empty desk", () => {
  assert.deepEqual(summarizeDesk([]), {
    activeTradeCount: 0,
    bookedTradeCount: 0,
    exceptionCount: 0,
    buyExposure: 0,
    sellExposure: 0,
    netExposure: 0,
    grossPrincipal: 0,
  });
});
