export type ProductType =
  | "agency-rmbs"
  | "non-agency-rmbs"
  | "cmbs"
  | "abs"
  | "clo"
  | "tba-mbs";

export type TradeStatus = "draft" | "validated" | "booked" | "cancelled";
export type Side = "buy" | "sell";
export type TradeModifier =
  | "regular"
  | "specified-pool"
  | "stipulation"
  | "dollar-roll"
  | "weighted-average-price";
export type ExceptionSeverity = "error" | "warning";
export type AuditAction =
  | "created"
  | "updated"
  | "draft-saved"
  | "validated"
  | "booked"
  | "cancelled";

export const EXCEPTION_CODES = [
  "required-trade-date",
  "required-settlement-date",
  "required-security-id",
  "required-counterparty",
  "required-book",
  "required-trader",
  "required-agency",
  "required-pool",
  "invalid-original-face",
  "invalid-factor",
  "invalid-price",
  "settlement-before-trade",
  "invalid-security-id",
  "invalid-modifier-for-product",
  "allocation-mismatch",
  "missing-client-trade-id",
] as const;

export type ExceptionCode = (typeof EXCEPTION_CODES)[number];

export interface AllocationInput {
  id: string;
  label: string;
  currentFace: number | null;
}

export interface Allocation {
  id: string;
  label: string;
  currentFace: number;
}

export interface AuditEvent {
  id: string;
  at: string;
  action: AuditAction;
  detail: string;
}

export interface TradeEconomics {
  currentFace: number;
  grossPrincipal: number;
  signedExposure: number;
}

export interface TradeDraft {
  internalTradeId: string | null;
  clientTradeId: string;
  executionTimestamp: string;
  tradeDate: string;
  settlementDate: string;
  side: Side;
  productType: ProductType;
  securityId: string;
  issuerDeal: string;
  trancheClass: string;
  counterparty: string;
  book: string;
  trader: string;
  currency: "USD";
  originalFace: number | null;
  factor: number | null;
  price: number | null;
  coupon: number | null;
  spreadBps: number | null;
  accruedInterest: number | null;
  agency: string;
  poolNumber: string;
  weightedAverageLife: number | null;
  collateralType: string;
  rating: string;
  modifier: TradeModifier;
  allocations: AllocationInput[];
  note: string;
}

export interface TradeException {
  code: ExceptionCode;
  severity: ExceptionSeverity;
  field: keyof TradeDraft;
  message: string;
}

export type Trade = Omit<TradeDraft, "internalTradeId" | "allocations"> & {
  internalTradeId: string;
  status: TradeStatus;
  allocations: Allocation[];
  economics: TradeEconomics;
  exceptions: TradeException[];
  auditEvents: AuditEvent[];
  synthetic: true;
};

export interface DeskSummary {
  activeTradeCount: number;
  bookedTradeCount: number;
  exceptionCount: number;
  buyExposure: number;
  sellExposure: number;
  netExposure: number;
  grossPrincipal: number;
}

export type TradeSort =
  | "execution-desc"
  | "current-face-desc"
  | "gross-principal-desc";

export interface TradeTicketProps {
  draft: TradeDraft;
  exceptions: readonly TradeException[];
  editingTradeId: string | null;
  hasBlockingErrors: boolean;
  isReadOnly: boolean;
  isValidatedEdit: boolean;
  onChange(next: TradeDraft): void;
  onSaveDraft(): void;
  onValidate(): void;
  onBook(): void;
  onReset(): void;
}

export interface DeskInsightsProps {
  summary: DeskSummary;
}

export interface TradeBlotterProps {
  trades: readonly Trade[];
  selectedTradeId: string | null;
  product: ProductType | "all";
  status: TradeStatus | "all";
  search: string;
  sort: TradeSort;
  onProductChange(value: ProductType | "all"): void;
  onStatusChange(value: TradeStatus | "all"): void;
  onSearchChange(value: string): void;
  onSortChange(value: TradeSort): void;
  onSelect(id: string): void;
}

export interface TradeReviewProps {
  trade: Trade | null;
  onEditDraft(id: string): void;
  onCancel(id: string): void;
}

export interface LifecycleContext {
  id: string;
  at: string;
}
