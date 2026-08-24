import { summarizeDesk } from "../domain/calculations.ts";
import type { DeskSummary, Trade, TradeSort } from "../domain/types.ts";
import type { TradeCaptureState } from "./reducer.ts";

const comparators: Record<TradeSort, (left: Trade, right: Trade) => number> = {
  "execution-desc": (left, right) => right.executionTimestamp.localeCompare(left.executionTimestamp),
  "current-face-desc": (left, right) => right.economics.currentFace - left.economics.currentFace,
  "gross-principal-desc": (left, right) => right.economics.grossPrincipal - left.economics.grossPrincipal,
};

function matchesSearch(trade: Trade, search: string): boolean {
  if (!search) return true;
  return [
    trade.internalTradeId,
    trade.clientTradeId,
    trade.securityId,
    trade.issuerDeal,
    trade.counterparty,
  ].some((value) => value.toLocaleLowerCase("en-US").includes(search));
}

export function selectVisibleTrades(state: TradeCaptureState): readonly Trade[] {
  const search = state.search.trim().toLocaleLowerCase("en-US");
  const compare = comparators[state.sort];

  return state.trades
    .filter((trade) => state.product === "all" || trade.productType === state.product)
    .filter((trade) => state.status === "all" || trade.status === state.status)
    .filter((trade) => matchesSearch(trade, search))
    .slice()
    .sort((left, right) => compare(left, right) || left.internalTradeId.localeCompare(right.internalTradeId));
}

export function selectSelectedTrade(state: TradeCaptureState): Trade | null {
  return state.trades.find((trade) => trade.internalTradeId === state.selectedTradeId) ?? null;
}

export function selectDeskSummary(state: TradeCaptureState): DeskSummary {
  return summarizeDesk(state.trades);
}
