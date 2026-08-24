import type { TradeReviewProps } from "../domain/types.ts";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const quantity = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const eventTime = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

function formatEventTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : eventTime.format(date);
}

export function TradeReview({ trade, onEditDraft, onCancel }: TradeReviewProps) {
  if (!trade) {
    return (
      <aside className="tc-panel tc-review" aria-labelledby="tc-review-title">
        <div className="tc-panel-heading">
          <p className="tc-eyebrow">Selected record</p>
          <h2 id="tc-review-title">Trade review</h2>
        </div>
        <p className="tc-empty">Select a trade to inspect economics, exceptions, allocations, and audit history.</p>
      </aside>
    );
  }

  const canEdit = trade.status !== "cancelled";
  const canCancel = trade.status === "booked";

  return (
    <aside className="tc-panel tc-review" aria-labelledby="tc-review-title">
      <div className="tc-panel-heading tc-review-heading">
        <div>
          <p className="tc-eyebrow">Selected record</p>
          <h2 id="tc-review-title">Trade review</h2>
        </div>
        <span className={`tc-status tc-status-${trade.status}`}>{trade.status}</span>
      </div>

      <div className="tc-review-identity">
        <strong>{trade.internalTradeId}</strong>
        <span>{trade.securityId} · {trade.issuerDeal}</span>
        <span>{trade.side.toUpperCase()} with {trade.counterparty}</span>
      </div>

      <section className="tc-review-section" aria-labelledby="tc-review-economics">
        <h3 id="tc-review-economics">Economics</h3>
        <dl className="tc-detail-grid">
          <div><dt>Original face</dt><dd>{quantity.format(trade.originalFace ?? 0)}</dd></div>
          <div><dt>Factor</dt><dd>{trade.factor?.toFixed(6) ?? "—"}</dd></div>
          <div><dt>Current face</dt><dd>{quantity.format(trade.economics.currentFace)}</dd></div>
          <div><dt>Price</dt><dd>{trade.price?.toFixed(3) ?? "—"}</dd></div>
          <div><dt>Gross principal</dt><dd>{money.format(trade.economics.grossPrincipal)}</dd></div>
          <div><dt>Signed exposure</dt><dd className={trade.economics.signedExposure < 0 ? "tc-negative" : "tc-positive"}>{money.format(trade.economics.signedExposure)}</dd></div>
        </dl>
      </section>

      <section className="tc-review-section" aria-labelledby="tc-review-exceptions">
        <h3 id="tc-review-exceptions">Exceptions <span>{trade.exceptions.length}</span></h3>
        {trade.exceptions.length === 0 ? <p className="tc-review-clear">No stored exceptions.</p> : (
          <ul className="tc-exception-list">
            {trade.exceptions.map((item) => (
              <li key={`${item.code}-${item.field}`} className={`tc-exception tc-exception-${item.severity}`}>
                <strong>{item.severity}</strong><span>{item.message}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="tc-review-section" aria-labelledby="tc-review-allocations">
        <h3 id="tc-review-allocations">Allocations <span>{trade.allocations.length}</span></h3>
        {trade.allocations.length === 0 ? <p className="tc-review-muted">No allocations attached.</p> : (
          <dl className="tc-allocation-list">
            {trade.allocations.map((allocation) => (
              <div key={allocation.id}><dt>{allocation.label}</dt><dd>{quantity.format(allocation.currentFace)}</dd></div>
            ))}
          </dl>
        )}
      </section>

      <section className="tc-review-section" aria-labelledby="tc-review-note">
        <h3 id="tc-review-note">Note</h3>
        <p className="tc-review-note">{trade.note || "No note supplied."}</p>
      </section>

      <section className="tc-review-section" aria-labelledby="tc-review-audit">
        <h3 id="tc-review-audit">Audit history</h3>
        <ol className="tc-audit-list">
          {trade.auditEvents.map((event) => (
            <li key={event.id}>
              <span className="tc-audit-marker" aria-hidden="true" />
              <div><strong>{event.action.replaceAll("-", " ")}</strong><span>{event.detail}</span><time dateTime={event.at}>{formatEventTime(event.at)}</time></div>
            </li>
          ))}
        </ol>
      </section>

      <div className="tc-review-actions">
        <button type="button" disabled={!canEdit} onClick={() => onEditDraft(trade.internalTradeId)}>Edit in ticket</button>
        <button className="tc-danger-action" type="button" disabled={!canCancel} onClick={() => onCancel(trade.internalTradeId)}>Cancel trade</button>
      </div>
      {!canCancel ? <p className="tc-action-reason">Cancellation is available only for booked trades.</p> : null}
      {!canEdit ? <p className="tc-action-reason">Cancelled records are retained as read-only audit evidence.</p> : null}
    </aside>
  );
}
