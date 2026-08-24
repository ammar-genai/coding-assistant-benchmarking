import assert from "node:assert/strict";
import test from "node:test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const targetRoot = process.env.BENCHMARK_TARGET_ROOT;
assert.ok(targetRoot, "BENCHMARK_TARGET_ROOT is required");
const domain = await import(pathToFileURL(resolve(targetRoot, "app/trade-capture/domain/index.ts")));

function draft(overrides = {}) {
  return {
    ...domain.EMPTY_TRADE_DRAFT,
    internalTradeId: null,
    clientTradeId: "CLIENT-SYN-001",
    securityId: "AB12CD345",
    issuerDeal: "Synthetic Trust 2026-A",
    trancheClass: "A1",
    counterparty: "Synthetic Counterparty Alpha",
    book: "SP-MOCK-01",
    trader: "Synthetic Trader A",
    originalFace: 1_000_000,
    factor: 0.8,
    price: 99.5,
    agency: "FNMA",
    ...overrides,
  };
}

function codes(input) {
  return new Set(domain.validateTrade(input).map((item) => item.code));
}

test("validates required fields, bounds, identifiers, dates, and product modifiers", () => {
  const missing = codes({ ...domain.EMPTY_TRADE_DRAFT });
  for (const code of ["required-security-id", "required-counterparty", "required-book", "required-trader", "invalid-original-face", "invalid-factor", "invalid-price", "required-agency"]) {
    assert.equal(missing.has(code), true, code);
  }
  assert.equal(codes(draft()).size, 0);
  assert.equal(codes(draft({ factor: 0 })).has("invalid-factor"), true);
  assert.equal(codes(draft({ price: 251 })).has("invalid-price"), true);
  assert.equal(codes(draft({ securityId: "bad-id" })).has("invalid-security-id"), true);
  assert.equal(codes(draft({ settlementDate: "2026-08-22" })).has("settlement-before-trade"), true);
  assert.equal(codes(draft({ modifier: "specified-pool", poolNumber: "" })).has("required-pool"), true);
  assert.equal(codes(draft({ productType: "clo", modifier: "dollar-roll", agency: "" })).has("invalid-modifier-for-product"), true);
  assert.equal(codes(draft({ productType: "abs", modifier: "weighted-average-price", agency: "" })).has("invalid-modifier-for-product"), false);
});

test("treats a missing client ID as a warning and allocations within one cent as balanced", () => {
  const warning = domain.validateTrade(draft({ clientTradeId: "" }));
  assert.deepEqual(warning.map((item) => [item.code, item.severity]), [["missing-client-trade-id", "warning"]]);
  const balanced = draft({ allocations: [
    { id: "a", label: "Synthetic Allocation A", currentFace: 400_000 },
    { id: "b", label: "Synthetic Allocation B", currentFace: 399_999.99 },
  ] });
  assert.equal(codes(balanced).has("allocation-mismatch"), false);
  balanced.allocations[1].currentFace = 399_999.97;
  assert.equal(codes(balanced).has("allocation-mismatch"), true);
});

test("preserves identity and audit history through lifecycle transitions", () => {
  const created = domain.saveDraft(null, draft(), { id: "SYN-NEW-01", at: "2026-08-23T15:00:00.000Z" });
  assert.equal(created.internalTradeId, "SYN-NEW-01");
  assert.equal(created.status, "draft");
  assert.deepEqual(created.auditEvents.map((event) => event.action), ["created", "draft-saved"]);

  const edited = domain.validateTradeRecord(created, { ...draft(), internalTradeId: created.internalTradeId, note: "Edited" }, { id: "IGNORED", at: "2026-08-23T15:01:00.000Z" });
  assert.equal(edited.internalTradeId, created.internalTradeId);
  assert.equal(edited.status, "validated");
  assert.deepEqual(edited.auditEvents.slice(-2).map((event) => event.action), ["updated", "validated"]);

  const booked = domain.bookTrade(edited, { ...draft(), internalTradeId: edited.internalTradeId }, { id: "IGNORED", at: "2026-08-23T15:02:00.000Z" });
  assert.equal(booked.status, "booked");
  assert.equal(booked.auditEvents.at(-1).action, "booked");
  assert.throws(() => domain.bookTrade(null, draft({ price: 0 }), { id: "BAD", at: "2026-08-23T15:03:00.000Z" }));
  assert.throws(() => domain.cancelTrade(created, { id: "IGNORED", at: "2026-08-23T15:04:00.000Z" }));

  const cancelled = domain.cancelTrade(booked, { id: "IGNORED", at: "2026-08-23T15:05:00.000Z" });
  assert.equal(cancelled.status, "cancelled");
  assert.equal(cancelled.auditEvents.at(-1).action, "cancelled");
});

test("summaries preserve signed exposure and exclude cancelled records", () => {
  const buy = domain.bookTrade(null, draft(), { id: "BUY-1", at: "2026-08-23T15:00:00.000Z" });
  const sell = domain.bookTrade(null, draft({ side: "sell", originalFace: 500_000 }), { id: "SELL-1", at: "2026-08-23T15:00:00.000Z" });
  const cancelled = domain.cancelTrade(buy, { id: "IGNORED", at: "2026-08-23T16:00:00.000Z" });
  assert.deepEqual(domain.summarizeDesk([buy, sell, cancelled]), {
    activeTradeCount: 2,
    bookedTradeCount: 2,
    exceptionCount: 0,
    buyExposure: 796_000,
    sellExposure: -398_000,
    netExposure: 398_000,
    grossPrincipal: 1_194_000,
  });
});

test("provides six deterministic synthetic seed trades covering every product", () => {
  assert.equal(domain.SEED_TRADES.length, 6);
  assert.deepEqual(new Set(domain.SEED_TRADES.map((trade) => trade.productType)), new Set(["agency-rmbs", "non-agency-rmbs", "cmbs", "abs", "clo", "tba-mbs"]));
  assert.equal(new Set(domain.SEED_TRADES.map((trade) => trade.internalTradeId)).size, 6);
  assert.equal(domain.SEED_TRADES.every((trade) => trade.synthetic === true && trade.auditEvents.length > 0), true);
  assert.equal(domain.SEED_TRADES.some((trade) => trade.status === "booked"), true);
  assert.equal(domain.SEED_TRADES.some((trade) => trade.status === "cancelled"), true);
  assert.equal(domain.SEED_TRADES.some((trade) => trade.status === "draft" || trade.status === "validated"), true);
});
