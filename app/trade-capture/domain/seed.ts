import { calculateEconomics } from "./calculations.ts";
import type { Trade, TradeDraft } from "./types.ts";
import { validateTrade } from "./validation.ts";

export const EMPTY_TRADE_DRAFT: Readonly<TradeDraft> = Object.freeze({
  internalTradeId: null,
  clientTradeId: "",
  executionTimestamp: "2026-08-23T14:00:00.000Z",
  tradeDate: "2026-08-23",
  settlementDate: "2026-08-24",
  side: "buy",
  productType: "agency-rmbs",
  securityId: "",
  issuerDeal: "",
  trancheClass: "",
  counterparty: "",
  book: "",
  trader: "",
  currency: "USD",
  originalFace: null,
  factor: null,
  price: null,
  coupon: null,
  spreadBps: null,
  accruedInterest: null,
  agency: "",
  poolNumber: "",
  weightedAverageLife: null,
  collateralType: "",
  rating: "",
  modifier: "regular",
  allocations: [],
  note: "",
});

function seedDraft(overrides: Partial<TradeDraft>): TradeDraft {
  return {
    ...EMPTY_TRADE_DRAFT,
    clientTradeId: "SYNTH-CLIENT-01",
    executionTimestamp: "2026-08-23T14:05:00.000Z",
    tradeDate: "2026-08-23",
    settlementDate: "2026-08-25",
    securityId: "SYNTH0001",
    issuerDeal: "Fictional Harbor Trust",
    trancheClass: "A1",
    counterparty: "Demo Counterparty Alpha",
    book: "Mock Structured Credit",
    trader: "Sample Trader One",
    originalFace: 1_000_000,
    factor: 0.95,
    price: 99.25,
    coupon: 4.5,
    spreadBps: 120,
    agency: "Mock Agency",
    collateralType: "Synthetic collateral",
    rating: "AAA",
    ...overrides,
  };
}

function makeSeed(
  id: string,
  status: Trade["status"],
  draft: TradeDraft,
  actions: Trade["auditEvents"],
): Trade {
  const economics = calculateEconomics(draft.originalFace ?? 0, draft.factor ?? 0, draft.price ?? 0, draft.side);
  return {
    ...draft,
    internalTradeId: id,
    status,
    allocations: draft.allocations.map((allocation) => ({ ...allocation, currentFace: allocation.currentFace ?? 0 })),
    economics,
    exceptions: validateTrade(draft),
    auditEvents: actions,
    synthetic: true,
  };
}

function events(id: string, at: string, status: Trade["status"]): Trade["auditEvents"] {
  const result: Trade["auditEvents"] = [
    { id: `${id}-created`, at, action: "created", detail: "Synthetic seed trade created." },
  ];
  if (status === "draft") return result;
  result.push({ id: `${id}-validated`, at, action: "validated", detail: "Synthetic seed trade validated." });
  if (status === "validated") return result;
  result.push({ id: `${id}-booked`, at, action: "booked", detail: "Synthetic seed trade booked." });
  if (status === "cancelled") {
    result.push({ id: `${id}-cancelled`, at, action: "cancelled", detail: "Synthetic seed trade cancelled." });
  }
  return result;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
}

export const SEED_TRADES: readonly Trade[] = deepFreeze([
  makeSeed(
    "SYNTH-TRADE-001",
    "booked",
    seedDraft({ productType: "agency-rmbs", allocations: [{ id: "alloc-1", label: "Mock Account North", currentFace: 950_000 }] }),
    events("SYNTH-TRADE-001", "2026-08-23T14:05:00.000Z", "booked"),
  ),
  makeSeed(
    "SYNTH-TRADE-002",
    "booked",
    seedDraft({ productType: "non-agency-rmbs", side: "sell", securityId: "SYNTH0002", issuerDeal: "Fictional Maple Mortgage", counterparty: "Demo Counterparty Beta", book: "Mock Credit Opportunities", trader: "Sample Trader Two", factor: 0.82, price: 101.1, agency: "" }),
    events("SYNTH-TRADE-002", "2026-08-23T14:10:00.000Z", "booked"),
  ),
  makeSeed(
    "SYNTH-TRADE-003",
    "cancelled",
    seedDraft({ productType: "cmbs", securityId: "SYNTH0003", issuerDeal: "Fictional Meridian CMBS", counterparty: "Demo Counterparty Gamma", book: "Mock Real Estate Credit", trader: "Sample Trader Three", factor: 0.76, price: 98.4, modifier: "weighted-average-price", agency: "" }),
    events("SYNTH-TRADE-003", "2026-08-23T14:15:00.000Z", "cancelled"),
  ),
  makeSeed(
    "SYNTH-TRADE-004",
    "validated",
    seedDraft({ productType: "abs", side: "sell", securityId: "SYNTH0004", issuerDeal: "Fictional Aurora ABS", counterparty: "Demo Counterparty Delta", book: "Mock Consumer ABS", trader: "Sample Trader Four", factor: 0.91, price: 100.2, modifier: "weighted-average-price", agency: "" }),
    events("SYNTH-TRADE-004", "2026-08-23T14:20:00.000Z", "validated"),
  ),
  makeSeed(
    "SYNTH-TRADE-005",
    "draft",
    seedDraft({ productType: "clo", securityId: "SYNTH0005", issuerDeal: "Fictional Summit CLO", counterparty: "Demo Counterparty Epsilon", book: "Mock Loan Credit", trader: "Sample Trader Five", factor: 0.88, price: 97.75, agency: "", clientTradeId: "" }),
    events("SYNTH-TRADE-005", "2026-08-23T14:25:00.000Z", "draft"),
  ),
  makeSeed(
    "SYNTH-TRADE-006",
    "booked",
    seedDraft({ productType: "tba-mbs", side: "sell", securityId: "SYNTH0006", issuerDeal: "Fictional TBA Program", counterparty: "Demo Counterparty Zeta", book: "Mock Agency Desk", trader: "Sample Trader Six", factor: 1, price: 102.35, modifier: "dollar-roll", poolNumber: "", agency: "Mock Agency Two" }),
    events("SYNTH-TRADE-006", "2026-08-23T14:30:00.000Z", "booked"),
  ),
]);
