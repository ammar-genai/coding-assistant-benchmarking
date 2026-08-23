import type { TradeReviewProps } from "../domain/types.ts";

export function TradeReview({ trade, onEditDraft, onCancel }: TradeReviewProps) {
  return (
    <aside className="tc-panel tc-review" aria-labelledby="tc-review-title">
      <div className="tc-panel-heading">
        <p className="tc-eyebrow">Selected record</p>
        <h2 id="tc-review-title">Trade review</h2>
      </div>
      {trade ? (
        <div className="tc-review-body">
          <strong>{trade.internalTradeId}</strong>
          <span>{trade.securityId}</span>
          <button type="button" onClick={() => onEditDraft(trade.internalTradeId)}>Edit draft</button>
          <button type="button" onClick={() => onCancel(trade.internalTradeId)}>Cancel trade</button>
        </div>
      ) : <p className="tc-empty">Select a trade to inspect economics, exceptions, allocations, and audit history.</p>}
    </aside>
  );
}
