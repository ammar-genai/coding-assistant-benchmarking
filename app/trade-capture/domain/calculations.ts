import type { DeskSummary, Side, Trade, TradeEconomics } from "./types.ts";

export function withinOneCent(left: number, right: number): boolean {
  return Math.abs(Math.round(left * 100) - Math.round(right * 100)) <= 1;
}

export function calculateEconomics(
  originalFace: number,
  factor: number,
  price: number,
  side: Side,
): TradeEconomics {
  const currentFace = originalFace * factor;
  const grossPrincipal = currentFace * price / 100;
  return {
    currentFace,
    grossPrincipal,
    signedExposure: side === "buy" ? grossPrincipal : -grossPrincipal,
  };
}

export function summarizeDesk(trades: readonly Trade[]): DeskSummary {
  const active = trades.filter((trade) => trade.status !== "cancelled");
  const buyExposure = active.reduce(
    (sum, trade) => sum + Math.max(0, trade.economics.signedExposure),
    0,
  );
  const sellExposure = active.reduce(
    (sum, trade) => sum + Math.min(0, trade.economics.signedExposure),
    0,
  );
  return {
    activeTradeCount: active.length,
    bookedTradeCount: active.filter((trade) => trade.status === "booked").length,
    exceptionCount: active.reduce(
      (sum, trade) => sum + trade.exceptions.filter((item) => item.severity === "error").length,
      0,
    ),
    buyExposure,
    sellExposure,
    netExposure: buyExposure + sellExposure,
    grossPrincipal: active.reduce(
      (sum, trade) => sum + Math.abs(trade.economics.signedExposure),
      0,
    ),
  };
}
