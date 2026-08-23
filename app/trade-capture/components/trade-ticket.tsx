import type {
  ProductType,
  Side,
  TradeDraft,
  TradeException,
  TradeModifier,
  TradeTicketProps,
} from "../domain/types.ts";

const SIDES: ReadonlyArray<{ value: Side; label: string }> = [
  { value: "buy", label: "Buy" },
  { value: "sell", label: "Sell" },
];

const PRODUCT_TYPES: ReadonlyArray<{ value: ProductType; label: string }> = [
  { value: "agency-rmbs", label: "Agency RMBS" },
  { value: "non-agency-rmbs", label: "Non-agency RMBS" },
  { value: "cmbs", label: "CMBS" },
  { value: "abs", label: "ABS" },
  { value: "clo", label: "CLO" },
  { value: "tba-mbs", label: "TBA MBS" },
];

const MODIFIERS: ReadonlyArray<{ value: TradeModifier; label: string }> = [
  { value: "regular", label: "Regular" },
  { value: "specified-pool", label: "Specified pool" },
  { value: "stipulation", label: "Stipulation" },
  { value: "dollar-roll", label: "Dollar roll" },
  { value: "weighted-average-price", label: "Weighted-average price" },
];

function fieldExceptions(exceptions: readonly TradeException[], field: keyof TradeDraft): TradeException[] {
  return exceptions.filter((item) => item.field === field);
}

function FieldMessages({ field, items }: { field: keyof TradeDraft; items: TradeException[] }) {
  if (items.length === 0) return null;
  return (
    <div id={`tc-error-${field}`} className="tc-field-messages">
      {items.map((item) => (
        <p key={item.code} className={item.severity === "error" ? "tc-field-error" : "tc-field-warning"}>
          {item.message}
        </p>
      ))}
    </div>
  );
}

interface FieldControlProps {
  field: keyof TradeDraft;
  label: string;
  items: TradeException[];
}

function TextField({
  field,
  label,
  value,
  items,
  type = "text",
  onValueChange,
}: FieldControlProps & { value: string; type?: "text" | "date"; onValueChange: (value: string) => void }) {
  const inputId = `tc-field-${field}`;
  const hasMessage = items.length > 0;
  const isInvalid = items.some((item) => item.severity === "error");
  return (
    <div className="tc-field">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        type={type}
        value={value}
        aria-invalid={isInvalid ? true : undefined}
        aria-describedby={hasMessage ? `tc-error-${field}` : undefined}
        onChange={(event) => onValueChange(event.target.value)}
      />
      <FieldMessages field={field} items={items} />
    </div>
  );
}

function NumberField({
  field,
  label,
  value,
  items,
  onValueChange,
}: FieldControlProps & { value: number | null; onValueChange: (value: number | null) => void }) {
  const inputId = `tc-field-${field}`;
  const hasMessage = items.length > 0;
  const isInvalid = items.some((item) => item.severity === "error");
  return (
    <div className="tc-field">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        type="number"
        value={value === null ? "" : value}
        aria-invalid={isInvalid ? true : undefined}
        aria-describedby={hasMessage ? `tc-error-${field}` : undefined}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === "") {
            onValueChange(null);
            return;
          }
          const parsed = Number(raw);
          if (Number.isFinite(parsed)) onValueChange(parsed);
        }}
      />
      <FieldMessages field={field} items={items} />
    </div>
  );
}

function SelectField<Value extends string>({
  field,
  label,
  value,
  items,
  options,
  onValueChange,
}: FieldControlProps & {
  value: Value;
  options: ReadonlyArray<{ value: Value; label: string }>;
  onValueChange: (value: Value) => void;
}) {
  const inputId = `tc-field-${field}`;
  const hasMessage = items.length > 0;
  const isInvalid = items.some((item) => item.severity === "error");
  return (
    <div className="tc-field">
      <label htmlFor={inputId}>{label}</label>
      <select
        id={inputId}
        value={value}
        aria-invalid={isInvalid ? true : undefined}
        aria-describedby={hasMessage ? `tc-error-${field}` : undefined}
        onChange={(event) => onValueChange(event.target.value as Value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldMessages field={field} items={items} />
    </div>
  );
}

function TextAreaField({
  field,
  label,
  value,
  items,
  onValueChange,
}: FieldControlProps & { value: string; onValueChange: (value: string) => void }) {
  const inputId = `tc-field-${field}`;
  const hasMessage = items.length > 0;
  const isInvalid = items.some((item) => item.severity === "error");
  return (
    <div className="tc-field">
      <label htmlFor={inputId}>{label}</label>
      <textarea
        id={inputId}
        value={value}
        aria-invalid={isInvalid ? true : undefined}
        aria-describedby={hasMessage ? `tc-error-${field}` : undefined}
        onChange={(event) => onValueChange(event.target.value)}
      />
      <FieldMessages field={field} items={items} />
    </div>
  );
}

export function TradeTicket({
  draft,
  exceptions,
  onChange,
  onSaveDraft,
  onValidate,
  onBook,
  onReset,
}: TradeTicketProps) {
  const hasBookingErrors = exceptions.some((item) => item.severity === "error");

  function update<Field extends keyof TradeDraft>(field: Field, value: TradeDraft[Field]) {
    onChange({ ...draft, [field]: value });
  }

  return (
    <section className="tc-panel tc-ticket" aria-labelledby="tc-ticket-title">
      <div className="tc-panel-heading">
        <p className="tc-eyebrow">New trade</p>
        <h2 id="tc-ticket-title">Trade ticket</h2>
      </div>

      <fieldset className="tc-field-group">
        <legend>Identity</legend>
        <TextField
          field="clientTradeId"
          label="Client trade ID"
          value={draft.clientTradeId}
          items={fieldExceptions(exceptions, "clientTradeId")}
          onValueChange={(value) => update("clientTradeId", value)}
        />
        <TextField
          field="executionTimestamp"
          label="Execution timestamp"
          value={draft.executionTimestamp}
          items={fieldExceptions(exceptions, "executionTimestamp")}
          onValueChange={(value) => update("executionTimestamp", value)}
        />
        <TextField
          field="tradeDate"
          label="Trade date"
          type="date"
          value={draft.tradeDate}
          items={fieldExceptions(exceptions, "tradeDate")}
          onValueChange={(value) => update("tradeDate", value)}
        />
        <TextField
          field="settlementDate"
          label="Settlement date"
          type="date"
          value={draft.settlementDate}
          items={fieldExceptions(exceptions, "settlementDate")}
          onValueChange={(value) => update("settlementDate", value)}
        />
        <SelectField
          field="side"
          label="Side"
          value={draft.side}
          options={SIDES}
          items={fieldExceptions(exceptions, "side")}
          onValueChange={(value) => update("side", value)}
        />
        <TextField
          field="counterparty"
          label="Counterparty"
          value={draft.counterparty}
          items={fieldExceptions(exceptions, "counterparty")}
          onValueChange={(value) => update("counterparty", value)}
        />
        <TextField
          field="book"
          label="Book"
          value={draft.book}
          items={fieldExceptions(exceptions, "book")}
          onValueChange={(value) => update("book", value)}
        />
        <TextField
          field="trader"
          label="Trader"
          value={draft.trader}
          items={fieldExceptions(exceptions, "trader")}
          onValueChange={(value) => update("trader", value)}
        />
      </fieldset>

      <fieldset className="tc-field-group">
        <legend>Economics</legend>
        <div className="tc-field">
          <label htmlFor="tc-field-currency">Currency</label>
          <input id="tc-field-currency" type="text" value={draft.currency} disabled />
        </div>
        <NumberField
          field="originalFace"
          label="Original face"
          value={draft.originalFace}
          items={fieldExceptions(exceptions, "originalFace")}
          onValueChange={(value) => update("originalFace", value)}
        />
        <NumberField
          field="factor"
          label="Factor"
          value={draft.factor}
          items={fieldExceptions(exceptions, "factor")}
          onValueChange={(value) => update("factor", value)}
        />
        <NumberField
          field="price"
          label="Price"
          value={draft.price}
          items={fieldExceptions(exceptions, "price")}
          onValueChange={(value) => update("price", value)}
        />
        <NumberField
          field="coupon"
          label="Coupon"
          value={draft.coupon}
          items={fieldExceptions(exceptions, "coupon")}
          onValueChange={(value) => update("coupon", value)}
        />
        <NumberField
          field="spreadBps"
          label="Spread (bps)"
          value={draft.spreadBps}
          items={fieldExceptions(exceptions, "spreadBps")}
          onValueChange={(value) => update("spreadBps", value)}
        />
        <NumberField
          field="accruedInterest"
          label="Accrued interest"
          value={draft.accruedInterest}
          items={fieldExceptions(exceptions, "accruedInterest")}
          onValueChange={(value) => update("accruedInterest", value)}
        />
      </fieldset>

      <fieldset className="tc-field-group">
        <legend>Product detail</legend>
        <SelectField
          field="productType"
          label="Product type"
          value={draft.productType}
          options={PRODUCT_TYPES}
          items={fieldExceptions(exceptions, "productType")}
          onValueChange={(value) => update("productType", value)}
        />
        <TextField
          field="securityId"
          label="Security ID"
          value={draft.securityId}
          items={fieldExceptions(exceptions, "securityId")}
          onValueChange={(value) => update("securityId", value)}
        />
        <TextField
          field="issuerDeal"
          label="Issuer / deal"
          value={draft.issuerDeal}
          items={fieldExceptions(exceptions, "issuerDeal")}
          onValueChange={(value) => update("issuerDeal", value)}
        />
        <TextField
          field="trancheClass"
          label="Tranche class"
          value={draft.trancheClass}
          items={fieldExceptions(exceptions, "trancheClass")}
          onValueChange={(value) => update("trancheClass", value)}
        />
        <TextField
          field="agency"
          label="Agency"
          value={draft.agency}
          items={fieldExceptions(exceptions, "agency")}
          onValueChange={(value) => update("agency", value)}
        />
        <TextField
          field="poolNumber"
          label="Pool number"
          value={draft.poolNumber}
          items={fieldExceptions(exceptions, "poolNumber")}
          onValueChange={(value) => update("poolNumber", value)}
        />
        <NumberField
          field="weightedAverageLife"
          label="Weighted average life"
          value={draft.weightedAverageLife}
          items={fieldExceptions(exceptions, "weightedAverageLife")}
          onValueChange={(value) => update("weightedAverageLife", value)}
        />
        <TextField
          field="collateralType"
          label="Collateral type"
          value={draft.collateralType}
          items={fieldExceptions(exceptions, "collateralType")}
          onValueChange={(value) => update("collateralType", value)}
        />
        <TextField
          field="rating"
          label="Rating"
          value={draft.rating}
          items={fieldExceptions(exceptions, "rating")}
          onValueChange={(value) => update("rating", value)}
        />
        <SelectField
          field="modifier"
          label="Modifier"
          value={draft.modifier}
          options={MODIFIERS}
          items={fieldExceptions(exceptions, "modifier")}
          onValueChange={(value) => update("modifier", value)}
        />
      </fieldset>

      <fieldset className="tc-field-group">
        <legend>Notes</legend>
        <TextAreaField
          field="note"
          label="Note"
          value={draft.note}
          items={fieldExceptions(exceptions, "note")}
          onValueChange={(value) => update("note", value)}
        />
      </fieldset>

      <div className="tc-ticket-actions">
        <button type="button" onClick={onSaveDraft}>Save draft</button>
        <button type="button" onClick={onValidate}>Validate</button>
        <button type="button" disabled={hasBookingErrors} onClick={onBook}>Book trade</button>
        <button type="button" onClick={onReset}>Reset</button>
      </div>
      {hasBookingErrors ? <p className="tc-book-reason">Resolve validation errors before booking.</p> : null}
    </section>
  );
}
