import assert from "node:assert/strict";
import test from "node:test";

import { EMPTY_TRADE_DRAFT } from "../app/trade-capture/domain/seed.ts";
import { INITIAL_STATE, tradeCaptureReducer } from "../app/trade-capture/state/reducer.ts";
import { selectDeskSummary, selectSelectedTrade, selectVisibleTrades } from "../app/trade-capture/state/selectors.ts";

function validDraft(overrides = {}) {
  return {
    ...EMPTY_TRADE_DRAFT,
    allocations: [],
    clientTradeId: "SYNTH-NEW",
    securityId: "NEWMOCK01",
    issuerDeal: "Fictional New Trust",
    trancheClass: "A1",
    counterparty: "Demo Counterparty New",
    book: "Mock New Book",
    trader: "Sample Trader New",
    originalFace: 500_000,
    factor: 0.9,
    price: 100,
    agency: "Mock Agency",
    ...overrides,
  };
}

test("filters, searches, and sorts the synthetic blotter", () => {
  const filtered = tradeCaptureReducer(INITIAL_STATE, { type: "product-filtered", product: "clo" });
  assert.deepEqual(selectVisibleTrades(filtered).map((trade) => trade.productType), ["clo"]);

  const searched = tradeCaptureReducer(INITIAL_STATE, { type: "searched", search: "MAPLE" });
  assert.deepEqual(selectVisibleTrades(searched).map((trade) => trade.internalTradeId), ["SYNTH-TRADE-002"]);

  const sorted = tradeCaptureReducer(INITIAL_STATE, { type: "sorted", sort: "gross-principal-desc" });
  const principals = selectVisibleTrades(sorted).map((trade) => trade.economics.grossPrincipal);
  assert.deepEqual(principals, [...principals].sort((left, right) => right - left));

  const tieB = { ...INITIAL_STATE.trades[0], internalTradeId: "SYNTH-TIE-B" };
  const tieA = { ...INITIAL_STATE.trades[0], internalTradeId: "SYNTH-TIE-A" };
  const tieState = { ...INITIAL_STATE, trades: [tieB, tieA], sort: "current-face-desc" };
  assert.deepEqual(selectVisibleTrades(tieState).map((trade) => trade.internalTradeId), ["SYNTH-TIE-A", "SYNTH-TIE-B"]);
});

test("validates, books, and cancels without losing the active ticket or audit history", () => {
  const changed = tradeCaptureReducer(INITIAL_STATE, { type: "draft-changed", draft: validDraft() });
  const validated = tradeCaptureReducer(changed, {
    type: "validate",
    context: { id: "LOCAL-SYN-100", at: "2026-08-24T01:00:00.000Z" },
  });
  assert.equal(validated.trades.find((trade) => trade.internalTradeId === "LOCAL-SYN-100")?.status, "validated");
  assert.equal(validated.draft.internalTradeId, "LOCAL-SYN-100");
  assert.equal(validated.editingTradeId, "LOCAL-SYN-100");
  assert.equal(validated.validationVisible, true);

  const booked = tradeCaptureReducer(validated, {
    type: "book",
    context: { id: "LOCAL-EVENT-101", at: "2026-08-24T01:00:30.000Z" },
  });
  const created = booked.trades.find((trade) => trade.internalTradeId === "LOCAL-SYN-100");
  assert.equal(created?.status, "booked");
  assert.deepEqual(created?.auditEvents.map((event) => event.action), ["created", "validated", "updated", "booked"]);
  assert.equal(selectSelectedTrade(booked)?.internalTradeId, "LOCAL-SYN-100");
  assert.equal(booked.draft.internalTradeId, null);
  assert.equal(booked.editingTradeId, null);
  assert.equal(booked.validationVisible, false);

  const cancelled = tradeCaptureReducer(booked, {
    type: "cancel",
    id: "LOCAL-SYN-100",
    context: { id: "LOCAL-EVENT-100", at: "2026-08-24T01:01:00.000Z" },
  });
  const finalTrade = cancelled.trades.find((trade) => trade.internalTradeId === "LOCAL-SYN-100");
  assert.equal(finalTrade?.status, "cancelled");
  assert.deepEqual(finalTrade?.auditEvents.map((event) => event.action), ["created", "validated", "updated", "booked", "cancelled"]);
  assert.equal(tradeCaptureReducer(cancelled, { type: "edit", id: "LOCAL-SYN-100" }), cancelled);
});

test("saves and edits drafts, resets deterministically, and ignores immutable records", () => {
  const changed = tradeCaptureReducer(INITIAL_STATE, { type: "draft-changed", draft: validDraft() });
  const saved = tradeCaptureReducer(changed, {
    type: "save-draft",
    context: { id: "LOCAL-DRAFT-100", at: "2026-08-24T01:10:00.000Z" },
  });
  assert.equal(saved.trades.find((trade) => trade.internalTradeId === "LOCAL-DRAFT-100")?.status, "draft");
  assert.equal(saved.editingTradeId, "LOCAL-DRAFT-100");
  assert.equal(saved.draft.internalTradeId, "LOCAL-DRAFT-100");

  const reset = tradeCaptureReducer(saved, { type: "reset" });
  assert.equal(reset.editingTradeId, null);
  assert.equal(reset.draft.internalTradeId, null);
  assert.equal(reset.validationVisible, false);
  assert.ok(reset.exceptions.some((item) => item.severity === "error"));

  const editing = tradeCaptureReducer(reset, { type: "edit", id: "LOCAL-DRAFT-100" });
  assert.equal(editing.editingTradeId, "LOCAL-DRAFT-100");
  assert.equal(editing.validationVisible, true);

  const bookedSeed = INITIAL_STATE.trades.find((trade) => trade.status === "booked");
  assert.ok(bookedSeed);
  const reviewingBooked = tradeCaptureReducer(INITIAL_STATE, { type: "edit", id: bookedSeed.internalTradeId });
  assert.equal(reviewingBooked.editingTradeId, bookedSeed.internalTradeId);
  assert.throws(() => tradeCaptureReducer(reviewingBooked, {
    type: "save-draft",
    context: { id: "NO-REGRESSION", at: "2026-08-24T01:11:00.000Z" },
  }));
});

test("keeps cancelled trades visible but excludes them from desk totals", () => {
  const initialSummary = selectDeskSummary(INITIAL_STATE);
  const booked = INITIAL_STATE.trades.find((trade) => trade.status === "booked");
  assert.ok(booked);
  const cancelled = tradeCaptureReducer(INITIAL_STATE, {
    type: "cancel",
    id: booked.internalTradeId,
    context: { id: "LOCAL-EVENT-200", at: "2026-08-24T01:02:00.000Z" },
  });
  assert.equal(cancelled.trades.length, INITIAL_STATE.trades.length);
  assert.equal(selectDeskSummary(cancelled).activeTradeCount, initialSummary.activeTradeCount - 1);
});
