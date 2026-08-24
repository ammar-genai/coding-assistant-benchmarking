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
});

test("creates, edits, and cancels without losing audit history", () => {
  const changed = tradeCaptureReducer(INITIAL_STATE, { type: "draft-changed", draft: validDraft() });
  const booked = tradeCaptureReducer(changed, {
    type: "book",
    context: { id: "LOCAL-SYN-100", at: "2026-08-24T01:00:00.000Z" },
  });
  const created = booked.trades.find((trade) => trade.internalTradeId === "LOCAL-SYN-100");
  assert.equal(created?.status, "booked");
  assert.deepEqual(created?.auditEvents.map((event) => event.action), ["created", "booked"]);
  assert.equal(selectSelectedTrade(booked)?.internalTradeId, "LOCAL-SYN-100");

  const editing = tradeCaptureReducer(booked, { type: "edit", id: "LOCAL-SYN-100" });
  assert.equal(editing.editingTradeId, "LOCAL-SYN-100");
  assert.equal(editing.draft.internalTradeId, "LOCAL-SYN-100");

  const cancelled = tradeCaptureReducer(booked, {
    type: "cancel",
    id: "LOCAL-SYN-100",
    context: { id: "LOCAL-EVENT-100", at: "2026-08-24T01:01:00.000Z" },
  });
  const finalTrade = cancelled.trades.find((trade) => trade.internalTradeId === "LOCAL-SYN-100");
  assert.equal(finalTrade?.status, "cancelled");
  assert.deepEqual(finalTrade?.auditEvents.map((event) => event.action), ["created", "booked", "cancelled"]);
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
