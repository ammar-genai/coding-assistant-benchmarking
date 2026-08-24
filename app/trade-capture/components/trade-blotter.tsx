import type {
  ProductType,
  TradeBlotterProps,
  TradeSort,
  TradeStatus,
} from "../domain/types.ts";

const productOptions: ReadonlyArray<{ value: ProductType; label: string }> = [
  { value: "agency-rmbs", label: "Agency RMBS" },
  { value: "non-agency-rmbs", label: "Non-agency RMBS" },
  { value: "cmbs", label: "CMBS" },
  { value: "abs", label: "ABS" },
  { value: "clo", label: "CLO" },
  { value: "tba-mbs", label: "TBA MBS" },
];

const statusOptions: ReadonlyArray<{ value: TradeStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "validated", label: "Validated" },
  { value: "booked", label: "Booked" },
  { value: "cancelled", label: "Cancelled" },
];

const sortOptions: ReadonlyArray<{ value: TradeSort; label: string }> = [
  { value: "execution-desc", label: "Latest execution" },
  { value: "current-face-desc", label: "Largest current face" },
  { value: "gross-principal-desc", label: "Largest gross principal" },
];

const productLabels = Object.fromEntries(productOptions.map((item) => [item.value, item.label])) as Record<ProductType, string>;
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const quantity = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const executionTime = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

function formatExecution(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : executionTime.format(date);
}

export function TradeBlotter({
  trades,
  selectedTradeId,
  product,
  status,
  search,
  sort,
  onProductChange,
  onStatusChange,
  onSearchChange,
  onSortChange,
  onSelect,
}: TradeBlotterProps) {
  return (
    <section className="tc-panel tc-blotter" aria-labelledby="tc-blotter-title">
      <div className="tc-panel-heading tc-blotter-heading">
        <div>
          <p className="tc-eyebrow">Operations</p>
          <h2 id="tc-blotter-title">Trade blotter</h2>
        </div>
        <span className="tc-result-count">{trades.length} {trades.length === 1 ? "record" : "records"}</span>
      </div>

      <div className="tc-filter-bar">
        <label className="tc-filter tc-search" htmlFor="tc-blotter-search">
          <span>Search</span>
          <input
            id="tc-blotter-search"
            type="search"
            value={search}
            placeholder="Trade, security, deal, counterparty"
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
        <label className="tc-filter" htmlFor="tc-blotter-product">
          <span>Product</span>
          <select id="tc-blotter-product" value={product} onChange={(event) => onProductChange(event.target.value as ProductType | "all")}>
            <option value="all">All products</option>
            {productOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="tc-filter" htmlFor="tc-blotter-status">
          <span>Status</span>
          <select id="tc-blotter-status" value={status} onChange={(event) => onStatusChange(event.target.value as TradeStatus | "all")}>
            <option value="all">All statuses</option>
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="tc-filter" htmlFor="tc-blotter-sort">
          <span>Sort</span>
          <select id="tc-blotter-sort" value={sort} onChange={(event) => onSortChange(event.target.value as TradeSort)}>
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>

      <div className="tc-table-region" role="region" aria-label="Trade blotter table" tabIndex={0}>
        <table className="tc-table">
          <caption>Today&apos;s synthetic securitized-product trades</caption>
          <thead>
            <tr>
              <th scope="col">Open</th>
              <th scope="col">Trade / security</th>
              <th scope="col">Product</th>
              <th scope="col">Side</th>
              <th scope="col">Executed</th>
              <th scope="col">Current face</th>
              <th scope="col">Price</th>
              <th scope="col">Gross principal</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 ? (
              <tr><td className="tc-table-empty" colSpan={9}>No synthetic trades match these filters.</td></tr>
            ) : trades.map((trade) => {
              const selected = selectedTradeId === trade.internalTradeId;
              return (
                <tr key={trade.internalTradeId} className={selected ? "tc-row-selected" : undefined}>
                  <td>
                    <button
                      className="tc-row-action"
                      type="button"
                      aria-pressed={selected}
                      aria-label={`Review ${trade.internalTradeId}`}
                      onClick={() => onSelect(trade.internalTradeId)}
                    >{selected ? "Open" : "View"}</button>
                  </td>
                  <th scope="row">
                    <span className="tc-trade-id">{trade.internalTradeId}</span>
                    <span className="tc-security-id">{trade.securityId}</span>
                  </th>
                  <td>{productLabels[trade.productType]}</td>
                  <td><span className={`tc-side tc-side-${trade.side}`}>{trade.side}</span></td>
                  <td>{formatExecution(trade.executionTimestamp)}</td>
                  <td className="tc-number">{quantity.format(trade.economics.currentFace)}</td>
                  <td className="tc-number">{trade.price?.toFixed(3) ?? "—"}</td>
                  <td className="tc-number">{money.format(trade.economics.grossPrincipal)}</td>
                  <td><span className={`tc-status tc-status-${trade.status}`}>{trade.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
