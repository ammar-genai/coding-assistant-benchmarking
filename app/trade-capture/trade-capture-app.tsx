"use client";

import { useReducer } from "react";
import { DeskInsights } from "./components/desk-insights.tsx";
import { TradeBlotter } from "./components/trade-blotter.tsx";
import { TradeReview } from "./components/trade-review.tsx";
import { TradeTicket } from "./components/trade-ticket.tsx";
import { INITIAL_STATE, tradeCaptureReducer } from "./state/reducer.ts";
import { selectDeskSummary, selectSelectedTrade, selectVisibleTrades } from "./state/selectors.ts";

export function TradeCaptureApp() {
  const [state, dispatch] = useReducer(tradeCaptureReducer, INITIAL_STATE);
  const visibleTrades = selectVisibleTrades(state);

  return (
    <main className="tc-shell">
      <header className="tc-hero">
        <div><p className="tc-eyebrow">Securitized products · operations lab</p><h1>Capture the trade. See the desk.</h1></div>
        <p className="tc-synthetic-notice">Synthetic demo data only. No customer, market, or booking system is connected.</p>
      </header>
      <DeskInsights summary={selectDeskSummary(state)} />
      <div className="tc-workspace">
        <TradeTicket
          draft={state.draft}
          exceptions={state.exceptions}
          onChange={(draft) => dispatch({ type: "draft-changed", draft })}
          onSaveDraft={() => undefined}
          onValidate={() => undefined}
          onBook={() => undefined}
          onReset={() => undefined}
        />
        <TradeReview trade={selectSelectedTrade(state)} onEditDraft={() => undefined} onCancel={() => undefined} />
      </div>
      <div className="tc-validation" role="status" aria-live="polite">{state.exceptions.length} validation messages</div>
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
