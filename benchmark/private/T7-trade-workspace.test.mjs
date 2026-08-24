import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const targetRoot = process.env.BENCHMARK_TARGET_ROOT;
assert.ok(targetRoot, "BENCHMARK_TARGET_ROOT is required");
const fromTarget = (path) => pathToFileURL(resolve(targetRoot, path));
const { EMPTY_TRADE_DRAFT } = await import(fromTarget("app/trade-capture/domain/seed.ts"));
const { INITIAL_STATE, tradeCaptureReducer } = await import(fromTarget("app/trade-capture/state/reducer.ts"));
const selectors = await import(fromTarget("app/trade-capture/state/selectors.ts"));

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

test("selectors filter, search, and stably sort seed trades", () => {
  const productState = tradeCaptureReducer(INITIAL_STATE, { type: "product-filtered", product: "clo" });
  assert.equal(selectors.selectVisibleTrades(productState).every((trade) => trade.productType === "clo"), true);

  const searchState = tradeCaptureReducer(INITIAL_STATE, { type: "searched", search: "maple" });
  assert.deepEqual(selectors.selectVisibleTrades(searchState).map((trade) => trade.internalTradeId), ["SYNTH-TRADE-002"]);

  const statusState = tradeCaptureReducer(INITIAL_STATE, { type: "status-filtered", status: "booked" });
  assert.equal(selectors.selectVisibleTrades(statusState).every((trade) => trade.status === "booked"), true);

  for (const sort of ["execution-desc", "current-face-desc", "gross-principal-desc"]) {
    const sorted = selectors.selectVisibleTrades(tradeCaptureReducer(INITIAL_STATE, { type: "sorted", sort }));
    assert.equal(sorted.length, INITIAL_STATE.trades.length);
    assert.equal(new Set(sorted.map((trade) => trade.internalTradeId)).size, sorted.length);
  }
});

test("reducer owns validation, lifecycle, edit, reset, and cancellation", () => {
  const invalid = tradeCaptureReducer(INITIAL_STATE, { type: "draft-changed", draft: { ...EMPTY_TRADE_DRAFT, allocations: [] } });
  assert.equal(invalid.exceptions.some((item) => item.severity === "error"), true);

  const changed = tradeCaptureReducer(INITIAL_STATE, { type: "draft-changed", draft: validDraft() });
  const saved = tradeCaptureReducer(changed, { type: "save-draft", context: { id: "LOCAL-SYN-100", at: "2026-08-23T18:00:00.000Z" } });
  assert.equal(saved.trades.some((trade) => trade.internalTradeId === "LOCAL-SYN-100" && trade.status === "draft"), true);
  assert.equal(saved.selectedTradeId, "LOCAL-SYN-100");

  const bookedSeed = INITIAL_STATE.trades.find((trade) => trade.status === "booked");
  assert.ok(bookedSeed);
  const editing = tradeCaptureReducer(INITIAL_STATE, { type: "edit", id: bookedSeed.internalTradeId });
  assert.equal(editing.editingTradeId, bookedSeed.internalTradeId);
  assert.equal(editing.draft.internalTradeId, bookedSeed.internalTradeId);
  const reset = tradeCaptureReducer(editing, { type: "reset" });
  assert.equal(reset.editingTradeId, null);
  assert.equal(reset.draft.internalTradeId, null);

  const cancelled = tradeCaptureReducer(INITIAL_STATE, { type: "cancel", id: bookedSeed.internalTradeId, context: { id: "EVENT-CANCEL-1", at: "2026-08-23T18:05:00.000Z" } });
  assert.equal(cancelled.trades.find((trade) => trade.internalTradeId === bookedSeed.internalTradeId)?.status, "cancelled");
  assert.equal(cancelled.selectedTradeId, bookedSeed.internalTradeId);
});

test("blotter and review preserve the frozen control semantics", async () => {
  const blotter = await readFile(resolve(targetRoot, "app/trade-capture/components/trade-blotter.tsx"), "utf8");
  assert.match(blotter, /<caption/);
  assert.match(blotter, /role=["']region["']/);
  assert.match(blotter, /tabIndex=\{?0\}?/);
  assert.match(blotter, /aria-label|aria-labelledby/);
  assert.match(blotter, /aria-pressed/);
  assert.match(blotter, /All products/i);
  assert.match(blotter, /All statuses/i);

  const review = await readFile(resolve(targetRoot, "app/trade-capture/components/trade-review.tsx"), "utf8");
  for (const value of ["economics", "exceptions", "allocations", "auditEvents"]) {
    assert.match(review, new RegExp(value), value);
  }
  assert.match(review, /status\s*===?\s*["']booked["']/);
});

test("application dispatches explicit lifecycle contexts and route CSS stays scoped", async () => {
  const app = await readFile(resolve(targetRoot, "app/trade-capture/trade-capture-app.tsx"), "utf8");
  for (const action of ["save-draft", "validate", "book", "edit", "cancel", "reset"]) {
    assert.match(app, new RegExp(action), action);
  }
  assert.match(app, /Date\s*\(|Date\.now|toISOString/);
  assert.match(app, /randomUUID|crypto\.|LOCAL|SYN/);
  assert.match(app, /role=["']status["']/);

  const css = await readFile(resolve(targetRoot, "app/trade-capture/trade-capture.css"), "utf8");
  assert.doesNotMatch(css, /:root|(^|[\s,{])\*([\s,{:]|$)/m);
  const selectorLines = css.split("\n")
    .map((line) => line.trim())
    .filter((line) => line.endsWith("{") && !line.startsWith("@"));
  assert.ok(selectorLines.length > 10);
  assert.equal(selectorLines.every((line) => line.startsWith(".tc-")), true, selectorLines.join("\n"));
  assert.match(css, /@media[^{]*max-width:\s*760px|@media[^{]*max-width:\s*[4-7][0-9]{2}px/);
  assert.match(css, /:focus-visible/);
});
