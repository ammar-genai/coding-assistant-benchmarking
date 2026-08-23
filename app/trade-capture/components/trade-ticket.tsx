import type { TradeTicketProps } from "../domain/types.ts";

export function TradeTicket({
  draft,
  exceptions,
  onChange,
  onSaveDraft,
  onValidate,
  onBook,
  onReset,
}: TradeTicketProps) {
  const hasErrors = exceptions.some((item) => item.severity === "error");

  return (
    <section className="tc-panel tc-ticket" aria-labelledby="tc-ticket-title">
      <div className="tc-panel-heading">
        <p className="tc-eyebrow">New trade</p>
        <h2 id="tc-ticket-title">Trade ticket</h2>
      </div>
      <label className="tc-field" htmlFor="tc-field-securityId">
        Security ID
        <input
          id="tc-field-securityId"
          value={draft.securityId}
          onChange={(event) => onChange({ ...draft, securityId: event.target.value })}
        />
      </label>
      <div className="tc-ticket-actions">
        <button type="button" onClick={onSaveDraft}>Save draft</button>
        <button type="button" onClick={onValidate}>Validate</button>
        <button type="button" disabled={hasErrors} onClick={onBook}>Book trade</button>
        <button type="button" onClick={onReset}>Reset</button>
      </div>
      {hasErrors ? <p className="tc-book-reason">Resolve validation errors before booking.</p> : null}
    </section>
  );
}
