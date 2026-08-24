import { withinOneCent } from "./calculations.ts";
import type { ExceptionCode, TradeDraft, TradeException } from "./types.ts";

function exception(
  code: ExceptionCode,
  field: keyof TradeDraft,
  message: string,
  severity: TradeException["severity"] = "error",
): TradeException {
  return { code, field, message, severity };
}

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

export function validateTrade(draft: TradeDraft): TradeException[] {
  const exceptions: TradeException[] = [];

  if (!hasText(draft.tradeDate)) {
    exceptions.push(exception("required-trade-date", "tradeDate", "Trade date is required."));
  }
  if (!hasText(draft.settlementDate)) {
    exceptions.push(exception("required-settlement-date", "settlementDate", "Settlement date is required."));
  }
  if (!hasText(draft.securityId)) {
    exceptions.push(exception("required-security-id", "securityId", "Security identifier is required."));
  } else if (!/^[A-Z0-9]{9}$/.test(draft.securityId)) {
    exceptions.push(exception("invalid-security-id", "securityId", "Security identifier must be nine uppercase letters or digits."));
  }
  if (!hasText(draft.counterparty)) exceptions.push(exception("required-counterparty", "counterparty", "Counterparty is required."));
  if (!hasText(draft.book)) exceptions.push(exception("required-book", "book", "Book is required."));
  if (!hasText(draft.trader)) exceptions.push(exception("required-trader", "trader", "Trader is required."));
  if (!hasText(draft.clientTradeId)) {
    exceptions.push(exception("missing-client-trade-id", "clientTradeId", "Client trade ID is missing.", "warning"));
  }

  const invalidOriginalFace = !Number.isFinite(draft.originalFace) || draft.originalFace === null || draft.originalFace <= 0;
  const invalidFactor = !Number.isFinite(draft.factor) || draft.factor === null || draft.factor <= 0 || draft.factor > 1;
  const invalidPrice = !Number.isFinite(draft.price) || draft.price === null || draft.price <= 0 || draft.price > 250;
  if (invalidOriginalFace) exceptions.push(exception("invalid-original-face", "originalFace", "Original face must be greater than zero."));
  if (invalidFactor) exceptions.push(exception("invalid-factor", "factor", "Factor must be greater than zero and no more than one."));
  if (invalidPrice) exceptions.push(exception("invalid-price", "price", "Price must be greater than zero and no more than 250."));

  if (draft.tradeDate && draft.settlementDate && draft.settlementDate < draft.tradeDate) {
    exceptions.push(exception("settlement-before-trade", "settlementDate", "Settlement date cannot precede trade date."));
  }
  if ((draft.productType === "agency-rmbs" || draft.productType === "tba-mbs") && !hasText(draft.agency)) {
    exceptions.push(exception("required-agency", "agency", "Agency is required for this product."));
  }
  if (draft.modifier === "specified-pool" && !hasText(draft.poolNumber)) {
    exceptions.push(exception("required-pool", "poolNumber", "Pool number is required for specified-pool trades."));
  }
  if ((draft.modifier === "dollar-roll" || draft.modifier === "stipulation") && draft.productType !== "tba-mbs") {
    exceptions.push(exception("invalid-modifier-for-product", "modifier", "This modifier is valid only for TBA MBS."));
  }
  if (draft.modifier === "weighted-average-price" && draft.productType !== "abs" && draft.productType !== "cmbs") {
    exceptions.push(exception("invalid-modifier-for-product", "modifier", "Weighted-average-price is valid only for ABS or CMBS."));
  }

  if (draft.allocations.length > 0) {
    const invalidAllocation = draft.allocations.some((allocation) =>
      allocation.currentFace === null || !Number.isFinite(allocation.currentFace) || allocation.currentFace < 0,
    );
    const currentFace = typeof draft.originalFace === "number" && typeof draft.factor === "number"
      ? draft.originalFace * draft.factor
      : null;
    const total = draft.allocations.reduce((sum, allocation) => sum + (allocation.currentFace ?? 0), 0);
    if (invalidAllocation || currentFace === null || !withinOneCent(total, currentFace)) {
      exceptions.push(exception("allocation-mismatch", "allocations", "Allocations must total current face within one cent."));
    }
  }

  return exceptions;
}
