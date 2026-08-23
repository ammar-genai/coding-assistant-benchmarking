import { summarizeDesk } from "../domain/calculations.ts";
import type { Trade } from "../domain/types.ts";
import type { TradeCaptureState } from "./reducer.ts";

export function selectVisibleTrades(state: TradeCaptureState): readonly Trade[] {
  return state.trades;
}

export function selectSelectedTrade(state: TradeCaptureState): Trade | null {
  return state.trades.find((trade) => trade.internalTradeId === state.selectedTradeId) ?? null;
}

export function selectDeskSummary(state: TradeCaptureState) {
  return summarizeDesk(state.trades);
}
