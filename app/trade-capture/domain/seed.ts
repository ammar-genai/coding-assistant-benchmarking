import type { Trade, TradeDraft } from "./types.ts";

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

export const SEED_TRADES: readonly Trade[] = [];
