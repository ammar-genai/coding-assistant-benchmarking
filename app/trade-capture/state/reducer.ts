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

export const INITIAL_STATE: TradeCaptureState = {
  trades: SEED_TRADES,
  draft: { ...EMPTY_TRADE_DRAFT, allocations: [] },
  exceptions: [],
  editingTradeId: null,
  selectedTradeId: null,
  product: "all",
  status: "all",
  search: "",
  sort: "execution-desc",
};

export function tradeCaptureReducer(state: TradeCaptureState, action: TradeCaptureAction): TradeCaptureState {
  if (action.type === "draft-changed") return { ...state, draft: action.draft };
  if (action.type === "selected") return { ...state, selectedTradeId: action.id };
  if (action.type === "product-filtered") return { ...state, product: action.product };
  if (action.type === "status-filtered") return { ...state, status: action.status };
  if (action.type === "searched") return { ...state, search: action.search };
  return action.type === "sorted" ? { ...state, sort: action.sort } : state;
}
