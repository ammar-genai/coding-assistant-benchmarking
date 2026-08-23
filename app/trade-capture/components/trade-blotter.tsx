import type {
  ProductType,
  TradeBlotterProps,
  TradeSort,
  TradeStatus,
} from "../domain/types.ts";

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
      <div className="tc-panel-heading">
        <p className="tc-eyebrow">Operations</p>
        <h2 id="tc-blotter-title">Trade blotter</h2>
      </div>
      <div className="tc-filter-bar">
        <label className="tc-field">Search<input value={search} onChange={(event) => onSearchChange(event.target.value)} /></label>
        <label className="tc-field">Product<select value={product} onChange={(event) => onProductChange(event.target.value as ProductType | "all")}><option value="all">All products</option></select></label>
        <label className="tc-field">Status<select value={status} onChange={(event) => onStatusChange(event.target.value as TradeStatus | "all")}><option value="all">All statuses</option></select></label>
        <label className="tc-field">Sort<select value={sort} onChange={(event) => onSortChange(event.target.value as TradeSort)}><option value="execution-desc">Latest execution</option></select></label>
      </div>
      <div className="tc-table-region" role="region" aria-label="Trade blotter table" tabIndex={0}>
        <table className="tc-table">
          <caption>Today&apos;s synthetic securitized-product trades</caption>
          <thead><tr><th scope="col">Select</th><th scope="col">Trade</th><th scope="col">Product</th><th scope="col">Status</th></tr></thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.internalTradeId}>
                <td><button type="button" aria-pressed={selectedTradeId === trade.internalTradeId} onClick={() => onSelect(trade.internalTradeId)}>View</button></td>
                <th scope="row">{trade.internalTradeId}</th>
                <td>{trade.productType}</td>
                <td>{trade.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
