import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const targetRoot = process.env.BENCHMARK_TARGET_ROOT;
assert.ok(targetRoot, "BENCHMARK_TARGET_ROOT is required");
const source = await readFile(resolve(targetRoot, "app/trade-capture/components/desk-insights.tsx"), "utf8");

test("renders every supplied desk metric", () => {
  for (const metric of [
    "activeTradeCount", "bookedTradeCount", "exceptionCount", "buyExposure",
    "sellExposure", "netExposure", "grossPrincipal",
  ]) {
    assert.match(source, new RegExp(metric), metric);
  }
  for (const label of ["Active", "Booked", "Exception", "Buy", "Sell", "Net", "Gross"]) {
    assert.match(source, new RegExp(label, "i"), label);
  }
});

test("formats monetary values without deriving domain totals", () => {
  assert.match(source, /Intl\.NumberFormat|toLocaleString/);
  assert.match(source, /USD|currency/);
  assert.doesNotMatch(source, /summarizeDesk|calculateEconomics|reduce\s*\(|\.filter\s*\(/);
  assert.doesNotMatch(source, /from\s+["'][^"']*(calculations|validation|lifecycle|state)/);
});

test("has a labelled summary landmark", () => {
  assert.match(source, /<(section|aside)/);
  assert.match(source, /aria-labelledby/);
  assert.match(source, /<h2/);
});
