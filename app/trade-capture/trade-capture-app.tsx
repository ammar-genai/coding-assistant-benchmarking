"use client";

import { useReducer, type CSSProperties } from "react";
import { DeskInsights } from "./components/desk-insights.tsx";
import { TradeBlotter } from "./components/trade-blotter.tsx";
import { TradeReview } from "./components/trade-review.tsx";
import { TradeTicket } from "./components/trade-ticket.tsx";
import type { LifecycleContext } from "./domain/types.ts";
import { INITIAL_STATE, tradeCaptureReducer } from "./state/reducer.ts";
import { selectDeskSummary, selectSelectedTrade, selectVisibleTrades } from "./state/selectors.ts";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function lifecycleContext(kind: "TRADE" | "EVENT"): LifecycleContext {
  const token = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID().slice(0, 8).toUpperCase()
    : Date.now().toString(36).toUpperCase();
  return {
    id: `LOCAL-${kind}-${token}`,
    at: new Date().toISOString(),
  };
}

export function TradeCaptureApp() {
  const [state, dispatch] = useReducer(tradeCaptureReducer, INITIAL_STATE);
  const visibleTrades = selectVisibleTrades(state);
  const visibleExceptions = state.validationVisible ? state.exceptions : [];
  const errorCount = visibleExceptions.filter((item) => item.severity === "error").length;
  const warningCount = visibleExceptions.filter((item) => item.severity === "warning").length;
  const hasBlockingErrors = state.exceptions.some((item) => item.severity === "error");
  const editingTrade = state.editingTradeId
    ? state.trades.find((trade) => trade.internalTradeId === state.editingTradeId)
    : null;

  return (
    <main className="tc-shell">
      <header
        className="tc-hero"
        style={{ "--tc-hero-image": `url("${basePath}/trade-capture-structure.png")` } as CSSProperties}
      >
        <div className="tc-hero-copy">
          <p className="tc-eyebrow">Securitized products · operations lab</p>
          <h1>Capture the trade.<br />See the desk.</h1>
          <p className="tc-hero-summary">A deterministic workflow mock for entering, validating, booking, reviewing, and cancelling structured-product trades.</p>
        </div>
        <div className="tc-hero-control">
          <span className="tc-live-dot" aria-hidden="true" />
          <div>
            <strong>Local control surface</strong>
            <span>Session state resets on reload</span>
          </div>
        </div>
        <p className="tc-synthetic-notice"><strong>Synthetic demo data only.</strong> No customer, market, pricing, settlement, or booking system is connected.</p>
      </header>

      <DeskInsights summary={selectDeskSummary(state)} />

      <div className={`tc-validation ${errorCount > 0 ? "tc-validation-error" : "tc-validation-ready"}`} role="status" aria-live="polite">
        <strong>{!state.validationVisible ? "Ticket ready for input" : errorCount > 0 ? "Ticket needs attention" : "Ticket can proceed"}</strong>
        <span>{!state.validationVisible
          ? "Validation begins when you edit the ticket."
          : `${errorCount} ${errorCount === 1 ? "error" : "errors"} · ${warningCount} ${warningCount === 1 ? "warning" : "warnings"}`}</span>
      </div>

      <div className="tc-workspace">
        <TradeTicket
          draft={state.draft}
          exceptions={visibleExceptions}
          editingTradeId={state.editingTradeId}
          hasBlockingErrors={hasBlockingErrors}
          isReadOnly={editingTrade?.status === "booked" || editingTrade?.status === "cancelled"}
          isValidatedEdit={editingTrade?.status === "validated"}
          onChange={(draft) => dispatch({ type: "draft-changed", draft })}
          onSaveDraft={() => dispatch({ type: "save-draft", context: lifecycleContext("TRADE") })}
          onValidate={() => dispatch({ type: "validate", context: lifecycleContext("TRADE") })}
          onBook={() => dispatch({ type: "book", context: lifecycleContext("TRADE") })}
          onReset={() => dispatch({ type: "reset" })}
        />
        <TradeReview
          trade={selectSelectedTrade(state)}
          onEditDraft={(id) => dispatch({ type: "edit", id })}
          onCancel={(id) => dispatch({ type: "cancel", id, context: lifecycleContext("EVENT") })}
        />
      </div>

      <TradeBlotter
        trades={visibleTrades}
        selectedTradeId={state.selectedTradeId}
        product={state.product}
        status={state.status}
        search={state.search}
        sort={state.sort}
        onProductChange={(product) => dispatch({ type: "product-filtered", product })}
        onStatusChange={(status) => dispatch({ type: "status-filtered", status })}
        onSearchChange={(search) => dispatch({ type: "searched", search })}
        onSortChange={(sort) => dispatch({ type: "sorted", sort })}
        onSelect={(id) => dispatch({ type: "selected", id })}
      />
    </main>
  );
}
