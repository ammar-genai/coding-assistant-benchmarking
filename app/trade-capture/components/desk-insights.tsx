import type { DeskInsightsProps } from "../domain/types.ts";

function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

function toneClass(value: number): string {
  if (value > 0) return "tc-positive";
  if (value < 0) return "tc-negative";
  return "tc-neutral";
}

export function DeskInsights({ summary }: DeskInsightsProps) {
  const {
    activeTradeCount,
    bookedTradeCount,
    exceptionCount,
    buyExposure,
    sellExposure,
    netExposure,
    grossPrincipal,
  } = summary;

  return (
    <section className="tc-panel tc-insights" aria-labelledby="tc-insights-title">
      <div className="tc-panel-heading">
        <p className="tc-eyebrow">Desk view</p>
        <h2 id="tc-insights-title">Today&apos;s position</h2>
      </div>
      <div className="tc-metric-group" aria-labelledby="tc-insights-activity-title">
        <h3 id="tc-insights-activity-title" className="tc-metric-group-title">Activity</h3>
        <dl className="tc-metric-grid">
          <div className="tc-metric">
            <dt className="tc-metric-label">Active trades</dt>
            <dd className="tc-metric-value">{formatCount(activeTradeCount)}</dd>
          </div>
          <div className="tc-metric">
            <dt className="tc-metric-label">Booked trades</dt>
            <dd className="tc-metric-value">{formatCount(bookedTradeCount)}</dd>
          </div>
          <div className="tc-metric">
            <dt className="tc-metric-label">Error exceptions</dt>
            <dd className={`tc-metric-value ${exceptionCount > 0 ? "tc-alert" : "tc-neutral"}`}>{formatCount(exceptionCount)}</dd>
          </div>
        </dl>
      </div>
      <div className="tc-metric-group" aria-labelledby="tc-insights-exposure-title">
        <h3 id="tc-insights-exposure-title" className="tc-metric-group-title">Exposure</h3>
        <dl className="tc-metric-grid">
          <div className="tc-metric">
            <dt className="tc-metric-label">Buy exposure</dt>
            <dd className={`tc-metric-value ${toneClass(buyExposure)}`}>{formatUsd(buyExposure)}</dd>
          </div>
          <div className="tc-metric">
            <dt className="tc-metric-label">Sell exposure</dt>
            <dd className={`tc-metric-value ${toneClass(sellExposure)}`}>{formatUsd(sellExposure)}</dd>
          </div>
          <div className="tc-metric">
            <dt className="tc-metric-label">Net exposure</dt>
            <dd className={`tc-metric-value ${toneClass(netExposure)}`}>{formatUsd(netExposure)}</dd>
          </div>
          <div className="tc-metric">
            <dt className="tc-metric-label">Gross principal</dt>
            <dd className="tc-metric-value">{formatUsd(grossPrincipal)}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
