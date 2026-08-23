import type { DeskInsightsProps } from "../domain/types.ts";

export function DeskInsights({ summary }: DeskInsightsProps) {
  return (
    <section className="tc-panel tc-insights" aria-labelledby="tc-insights-title">
      <div className="tc-panel-heading">
        <p className="tc-eyebrow">Desk view</p>
        <h2 id="tc-insights-title">Today&apos;s position</h2>
      </div>
      <dl className="tc-metric-grid">
        <div><dt>Active trades</dt><dd>{summary.activeTradeCount}</dd></div>
        <div><dt>Net exposure</dt><dd>{summary.netExposure.toLocaleString("en-US")}</dd></div>
      </dl>
    </section>
  );
}
