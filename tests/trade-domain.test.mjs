import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateEconomics,
  summarizeDesk,
  withinOneCent,
} from "../app/trade-capture/domain/calculations.ts";
import { bookTrade, cancelTrade, saveDraft, validateTradeRecord } from "../app/trade-capture/domain/lifecycle.ts";
import { EMPTY_TRADE_DRAFT, SEED_TRADES } from "../app/trade-capture/domain/seed.ts";
import { validateTrade } from "../app/trade-capture/domain/validation.ts";

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

function validDraft(overrides = {}) {
  return {
    ...EMPTY_TRADE_DRAFT,
    securityId: "SYNTH1234",
    counterparty: "Demo Counterparty",
    book: "Mock Book",
    trader: "Sample Trader",
    agency: "Mock Agency",
    originalFace: 100,
    factor: 0.5,
    price: 100,
    ...overrides,
  };
}

test("validates required fields, product rules, and rounded allocation boundaries", () => {
  const invalid = validDraft({
    securityId: "bad",
    settlementDate: "2026-08-22",
    agency: "",
    modifier: "specified-pool",
    poolNumber: "",
    allocations: [{ id: "a", label: "A", currentFace: 50.011 }],
  });
  assert.deepEqual(
    validateTrade(invalid).map((item) => item.code),
    ["invalid-security-id", "missing-client-trade-id", "settlement-before-trade", "required-agency", "required-pool"],
  );
  assert.equal(validateTrade(validDraft({ allocations: [{ id: "a", label: "A", currentFace: 50.02 }] })).at(-1)?.code, "allocation-mismatch");
  assert.equal(validateTrade(validDraft({ allocations: [{ id: "a", label: "A", currentFace: 50.01 }] })).some((item) => item.code === "allocation-mismatch"), false);
  assert.equal(validateTrade(validDraft({ productType: "clo", modifier: "dollar-roll" })).some((item) => item.code === "invalid-modifier-for-product"), true);
});

test("lifecycle actions are immutable, deterministic, and enforce transitions", () => {
  const draft = validDraft();
  const saved = saveDraft(null, draft, { id: "NEW-1", at: "2026-08-23T15:00:00.000Z" });
  assert.equal(saved.internalTradeId, "NEW-1");
  assert.deepEqual(saved.auditEvents.map((event) => event.action), ["created", "draft-saved"]);
  const validated = validateTradeRecord(
    saved,
    { ...draft, internalTradeId: "IGNORED" },
    { id: "EVENT-2", at: "2026-08-23T15:01:00.000Z" },
  );
  assert.equal(validated.internalTradeId, "NEW-1");
  assert.deepEqual(validated.auditEvents.map((event) => event.action), ["created", "draft-saved", "updated", "validated"]);
  const booked = bookTrade(validated, draft, { id: "EVENT-3", at: "2026-08-23T15:02:00.000Z" });
  const cancelled = cancelTrade(booked, { id: "EVENT-4", at: "2026-08-23T15:03:00.000Z" });
  assert.equal(booked.status, "booked");
  assert.equal(cancelled.status, "cancelled");
  assert.equal(booked.status, "booked");
  assert.throws(() => bookTrade(null, validDraft({ price: 0 }), { id: "BAD", at: "2026-08-23T15:04:00.000Z" }));
  assert.throws(() => cancelTrade(saved, { id: "NO", at: "2026-08-23T15:05:00.000Z" }));
});

test("seed trades are immutable, synthetic, complete, and excluded when cancelled", () => {
  assert.equal(SEED_TRADES.length, 6);
  assert.equal(new Set(SEED_TRADES.map((trade) => trade.productType)).size, 6);
  assert.equal(Object.isFrozen(SEED_TRADES[0]), true);
  const summary = summarizeDesk(SEED_TRADES);
  assert.equal(summary.activeTradeCount, 5);
  assert.equal(summary.bookedTradeCount, 3);
  assert.equal(summary.exceptionCount, 0);
  assert.ok(summary.sellExposure < 0);
});
