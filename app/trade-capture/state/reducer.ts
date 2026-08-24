import { bookTrade, cancelTrade, saveDraft, validateTradeRecord } from "../domain/lifecycle.ts";
import { EMPTY_TRADE_DRAFT, SEED_TRADES } from "../domain/seed.ts";
import type {
  LifecycleContext,
  ProductType,
  Trade,
  TradeDraft,
  TradeException,
  TradeSort,
  TradeStatus,
} from "../domain/types.ts";
import { validateTrade } from "../domain/validation.ts";

export interface TradeCaptureState {
  trades: readonly Trade[];
  draft: TradeDraft;
  exceptions: readonly TradeException[];
  editingTradeId: string | null;
  selectedTradeId: string | null;
  product: ProductType | "all";
  status: TradeStatus | "all";
  search: string;
  sort: TradeSort;
}

export type TradeCaptureAction =
  | { type: "draft-changed"; draft: TradeDraft }
  | { type: "reset" }
  | { type: "save-draft"; context: LifecycleContext }
  | { type: "validate"; context: LifecycleContext }
  | { type: "book"; context: LifecycleContext }
  | { type: "edit"; id: string }
  | { type: "cancel"; id: string; context: LifecycleContext }
  | { type: "selected"; id: string | null }
  | { type: "product-filtered"; product: ProductType | "all" }
  | { type: "status-filtered"; status: TradeStatus | "all" }
  | { type: "searched"; search: string }
  | { type: "sorted"; sort: TradeSort };

function emptyDraft(): TradeDraft {
  return { ...EMPTY_TRADE_DRAFT, allocations: [] };
}

function draftFromTrade(trade: Trade): TradeDraft {
  return {
    internalTradeId: trade.internalTradeId,
    clientTradeId: trade.clientTradeId,
    executionTimestamp: trade.executionTimestamp,
    tradeDate: trade.tradeDate,
    settlementDate: trade.settlementDate,
    side: trade.side,
    productType: trade.productType,
    securityId: trade.securityId,
    issuerDeal: trade.issuerDeal,
    trancheClass: trade.trancheClass,
    counterparty: trade.counterparty,
    book: trade.book,
    trader: trade.trader,
    currency: trade.currency,
    originalFace: trade.originalFace,
    factor: trade.factor,
    price: trade.price,
    coupon: trade.coupon,
    spreadBps: trade.spreadBps,
    accruedInterest: trade.accruedInterest,
    agency: trade.agency,
    poolNumber: trade.poolNumber,
    weightedAverageLife: trade.weightedAverageLife,
    collateralType: trade.collateralType,
    rating: trade.rating,
    modifier: trade.modifier,
    allocations: trade.allocations.map((allocation) => ({ ...allocation })),
    note: trade.note,
  };
}

function existingTrade(state: TradeCaptureState): Trade | null {
  if (!state.editingTradeId) return null;
  return state.trades.find((trade) => trade.internalTradeId === state.editingTradeId) ?? null;
}

function storeTrade(state: TradeCaptureState, trade: Trade): TradeCaptureState {
  const exists = state.trades.some((item) => item.internalTradeId === trade.internalTradeId);
  const trades = exists
    ? state.trades.map((item) => item.internalTradeId === trade.internalTradeId ? trade : item)
    : [...state.trades, trade];

  return {
    ...state,
    trades,
    draft: emptyDraft(),
    exceptions: [],
    editingTradeId: null,
    selectedTradeId: trade.internalTradeId,
  };
}

const initialDraft = emptyDraft();

export const INITIAL_STATE: TradeCaptureState = {
  trades: SEED_TRADES,
  draft: initialDraft,
  exceptions: validateTrade(initialDraft),
  editingTradeId: null,
  selectedTradeId: SEED_TRADES[0]?.internalTradeId ?? null,
  product: "all",
  status: "all",
  search: "",
  sort: "execution-desc",
};

export function tradeCaptureReducer(state: TradeCaptureState, action: TradeCaptureAction): TradeCaptureState {
  switch (action.type) {
    case "draft-changed":
      return { ...state, draft: action.draft, exceptions: validateTrade(action.draft) };
    case "reset": {
      const draft = emptyDraft();
      return { ...state, draft, exceptions: validateTrade(draft), editingTradeId: null };
    }
    case "save-draft":
      return storeTrade(state, saveDraft(existingTrade(state), state.draft, action.context));
    case "validate":
      return storeTrade(state, validateTradeRecord(existingTrade(state), state.draft, action.context));
    case "book":
      return storeTrade(state, bookTrade(existingTrade(state), state.draft, action.context));
    case "edit": {
      const trade = state.trades.find((item) => item.internalTradeId === action.id);
      if (!trade || trade.status === "cancelled") return state;
      const draft = draftFromTrade(trade);
      return {
        ...state,
        draft,
        exceptions: validateTrade(draft),
        editingTradeId: trade.internalTradeId,
        selectedTradeId: trade.internalTradeId,
      };
    }
    case "cancel": {
      const trade = state.trades.find((item) => item.internalTradeId === action.id);
      if (!trade) return state;
      const cancelled = cancelTrade(trade, action.context);
      return {
        ...state,
        trades: state.trades.map((item) => item.internalTradeId === cancelled.internalTradeId ? cancelled : item),
        selectedTradeId: cancelled.internalTradeId,
      };
    }
    case "selected":
      return { ...state, selectedTradeId: action.id };
    case "product-filtered":
      return { ...state, product: action.product };
    case "status-filtered":
      return { ...state, status: action.status };
    case "searched":
      return { ...state, search: action.search };
    case "sorted":
      return { ...state, sort: action.sort };
  }
}
