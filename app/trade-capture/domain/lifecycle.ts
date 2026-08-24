import { calculateEconomics } from "./calculations.ts";
import type { AuditAction, LifecycleContext, Trade, TradeDraft } from "./types.ts";
import { validateTrade } from "./validation.ts";

function audit(context: LifecycleContext, action: AuditAction, detail: string) {
  return { id: `${context.id}-${action}`, at: context.at, action, detail };
}

function record(
  existing: Trade | null,
  draft: TradeDraft,
  context: LifecycleContext,
  status: Trade["status"],
  action: AuditAction,
  exceptions = validateTrade(draft),
): Trade {
  const identity = existing?.internalTradeId ?? context.id;
  const history = existing
    ? [...existing.auditEvents, audit(context, "updated", "Synthetic trade updated.")]
    : [audit(context, "created", "Synthetic trade created.")];
  const originalFace = draft.originalFace ?? 0;
  const factor = draft.factor ?? 0;
  const price = draft.price ?? 0;

  return {
    ...draft,
    internalTradeId: identity,
    status,
    allocations: draft.allocations.map((allocation) => ({ ...allocation, currentFace: allocation.currentFace ?? 0 })),
    economics: calculateEconomics(originalFace, factor, price, draft.side),
    exceptions: [...exceptions],
    auditEvents: [...history, audit(context, action, `Synthetic trade ${action}.`)],
    synthetic: true,
  };
}

function assertEditable(existing: Trade | null): void {
  if (existing?.status === "booked" || existing?.status === "cancelled") {
    throw new Error("Booked and cancelled trades are immutable in this mock.");
  }
}

export function saveDraft(existing: Trade | null, draft: TradeDraft, context: LifecycleContext): Trade {
  assertEditable(existing);
  if (existing?.status === "validated") {
    throw new Error("Validated trades cannot return to draft.");
  }
  return record(existing, draft, context, "draft", "draft-saved");
}

export function validateTradeRecord(existing: Trade | null, draft: TradeDraft, context: LifecycleContext): Trade {
  assertEditable(existing);
  const exceptions = validateTrade(draft);
  if (exceptions.some((item) => item.severity === "error")) {
    throw new Error("Cannot validate a trade with validation errors.");
  }
  return record(existing, draft, context, "validated", "validated", exceptions);
}

export function bookTrade(existing: Trade | null, draft: TradeDraft, context: LifecycleContext): Trade {
  assertEditable(existing);
  const exceptions = validateTrade(draft);
  if (exceptions.some((item) => item.severity === "error")) {
    throw new Error("Cannot book a trade with validation errors.");
  }
  return record(existing, draft, context, "booked", "booked", exceptions);
}

export function cancelTrade(trade: Trade, context: LifecycleContext): Trade {
  if (trade.status !== "booked") {
    throw new Error("Only booked trades can be cancelled.");
  }
  return {
    ...trade,
    status: "cancelled",
    allocations: trade.allocations.map((allocation) => ({ ...allocation })),
    exceptions: [...trade.exceptions],
    auditEvents: [...trade.auditEvents, audit(context, "cancelled", "Synthetic trade cancelled.")],
  };
}
