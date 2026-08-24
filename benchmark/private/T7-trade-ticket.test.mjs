import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const targetRoot = process.env.BENCHMARK_TARGET_ROOT;
assert.ok(targetRoot, "BENCHMARK_TARGET_ROOT is required");
const source = await readFile(resolve(targetRoot, "app/trade-capture/components/trade-ticket.tsx"), "utf8");

test("covers the frozen ticket fields and actions", () => {
  for (const field of [
    "clientTradeId", "executionTimestamp", "tradeDate", "settlementDate", "side",
    "productType", "securityId", "issuerDeal", "trancheClass", "counterparty",
    "book", "trader", "originalFace", "factor", "price", "coupon", "spreadBps",
    "accruedInterest", "agency", "poolNumber", "weightedAverageLife",
    "collateralType", "rating", "modifier", "note",
  ]) {
    assert.match(source, new RegExp(field), field);
  }
  for (const handler of ["onSaveDraft", "onValidate", "onBook", "onReset", "onChange"]) {
    assert.match(source, new RegExp(handler), handler);
  }
});

test("provides semantic groups and linked error state", () => {
  assert.match(source, /<fieldset/);
  assert.match(source, /<legend/);
  assert.match(source, /aria-invalid/);
  assert.match(source, /aria-describedby/);
  assert.match(source, /tc-field-/);
  assert.match(source, /tc-error-/);
  assert.match(source, /severity\s*===?\s*["']error["']/);
  assert.match(source, /disabled=\{[^}]*hasErrors/);
  assert.match(source, /Resolve|resolve|before booking/);
});

test("keeps domain logic outside the component", () => {
  assert.doesNotMatch(source, /calculateEconomics|summarizeDesk|saveDraft|validateTradeRecord|bookTrade|cancelTrade/);
  assert.doesNotMatch(source, /from\s+["'][^"']*(calculations|validation|lifecycle|state)/);
});
