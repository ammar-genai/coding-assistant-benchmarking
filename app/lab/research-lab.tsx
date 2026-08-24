"use client";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const sitePath = (path: string) => `${basePath}${path}`;

import { useMemo, useState } from "react";

type Lane = "all" | "assistant" | "model" | "system";

const artifacts = [
  {
    index: "01",
    lane: "system" as const,
    title: "Trade Capture Workspace",
    type: "Live application",
    finding: "The distributed workflow produced an accepted securitized-products operations mock.",
    proof: "Capture, validate, book, review, filter, and cancel synthetic trades.",
    href: "/trade-capture/",
    action: "Open the live system",
    accent: "lime",
  },
  {
    index: "02",
    lane: "model" as const,
    title: "Neutral Pi Harness",
    type: "Comparison application",
    finding: "Five model routes ran through one fixed control surface across 20 counted observations.",
    proof: "Frozen prompts, timeouts, private checks, saved patches, and labeled telemetry.",
    href: "#run-matrix",
    action: "Inspect the matrix",
    accent: "blue",
  },
  {
    index: "03",
    lane: "assistant" as const,
    title: "Benchmark Orchestrator",
    type: "Execution application",
    finding: "Codex, Claude Code, and OpenCode were measured as complete products, not model aliases.",
    proof: "Named baselines, isolated worktrees, fixed prompts, patches, and acceptance gates.",
    href: "#pipeline",
    action: "See the workflow",
    accent: "coral",
  },
  {
    index: "04",
    lane: "system" as const,
    title: "Read-only Audit MCP",
    type: "Portable extension",
    finding: "The study can expose benchmark integrity without leaking private tests or mutating evidence.",
    proof: "Two read-only tools, traversal protection, assistant-specific configurations, and four passing tests.",
    href: "#audit",
    action: "Review the controls",
    accent: "mint",
  },
];

const phaseTwo = [
  ["GPT-5.6 Sol", "OpenAI", "100", "3/3", "333.389 s", "$0.0808", "Planner"],
  ["GLM 5.2", "Z.ai", "100", "3/3", "744.357 s", "$0.0562", "Hard-task worker"],
  ["Claude Fable 5", "Anthropic", "99.8", "3/3", "241.862 s", "$0.3644", "Speed premium"],
  ["Qwen3.8-27B", "Qwen", "98.8", "3/3", "621.744 s", "$0.0160", "Economical worker"],
  ["Kimi K3", "Moonshot AI", "68.75", "1/3", "1178.618 s", "$0.0760", "Experimental"],
];

const demoSteps = [
  ["01", "Begin with the research question", "Show why assistants and models must be measured separately."],
  ["02", "Open the model matrix", "Switch from product findings to the fixed Pi comparison."],
  ["03", "Launch trade capture", "Demonstrate the application produced by the distributed workflow."],
  ["04", "Explain the evidence gate", "Connect private tests, patches, telemetry, and audit controls."],
  ["05", "Land on the operating model", "Frontier planning, bounded workers, independent review, final integration."],
];

export default function LabApp() {
  const [lane, setLane] = useState<Lane>("all");
  const visibleArtifacts = useMemo(
    () => artifacts.filter((artifact) => lane === "all" || artifact.lane === lane),
    [lane],
  );

  return (
    <main className="lab-shell">
      <header className="lab-header">
        <a className="lab-brand" href={sitePath("/")} aria-label="Return to the field study"><span>CI</span><strong>Research Lab</strong></a>
        <nav aria-label="Research lab destinations">
          <a href={sitePath("/")}>Field study</a>
          <a href={sitePath("/trade-capture/")}>Trade capture</a>
          <a href={sitePath("/research-paper.pdf")}>Paper</a>
          <a href={sitePath("/presentation-deck.pptx")}>Deck</a>
        </nav>
      </header>

      <section className="lab-hero">
        <p className="lab-overline">Application layer / evidence system / guided demo</p>
        <h1>The work behind{" "}<br /><em>the findings.</em></h1>
        <p className="lab-lede">A live inventory of what was built: the trade system, comparison harness, orchestrator, audit extension, and evidence chain.</p>
        <div className="lab-hero-actions">
          <a href="#applications">Explore the applications</a>
          <a href={sitePath("/trade-capture/")}>Launch trade capture</a>
        </div>
        <div className="lab-signal" aria-label="Application status">
          <span>4 application layers</span><span>16 automated checks</span><span>1 reproducible evidence chain</span>
        </div>
      </section>

      <section className="lab-section" id="applications">
        <div className="lab-section-head">
          <div><p>01 / Application inventory</p><h2>Every claim has a working surface.</h2></div>
          <div className="lab-filters" role="group" aria-label="Filter application inventory">
            {(["all", "assistant", "model", "system"] as Lane[]).map((item) => (
              <button key={item} type="button" aria-pressed={lane === item} onClick={() => setLane(item)}>{item}</button>
            ))}
          </div>
        </div>
        <div className="artifact-list">
          {visibleArtifacts.map((artifact) => (
            <article className={`artifact-row accent-${artifact.accent}`} key={artifact.title}>
              <span className="artifact-index">{artifact.index}</span>
              <div className="artifact-title"><small>{artifact.type}</small><h3>{artifact.title}</h3></div>
              <p>{artifact.finding}</p>
              <div className="artifact-proof"><span>What it proves</span><p>{artifact.proof}</p></div>
              <a href={artifact.href.startsWith("/") ? sitePath(artifact.href) : artifact.href}>{artifact.action}<span aria-hidden="true">↗</span></a>
            </article>
          ))}
        </div>
      </section>

      <section className="lab-dark" id="run-matrix">
        <div className="lab-section-head lab-section-head-light">
          <div><p>02 / Neutral model application</p><h2>One harness removed the product advantage.</h2></div>
          <p>Same baseline, prompt, tools, provider, timeout, and zero-intervention policy. Only the model route changed.</p>
        </div>
        <div className="matrix-shell" role="region" aria-label="Neutral Pi model comparison" tabIndex={0}>
          <table>
            <thead><tr><th>Model route</th><th>Strict score</th><th>Write acceptance</th><th>Total time</th><th>Pi-reported cost</th><th>Role</th></tr></thead>
            <tbody>{phaseTwo.map(([model, maker, score, acceptance, time, cost, role]) => (
              <tr key={model}><td><strong>{model}</strong><span>{maker}</span></td><td>{score}</td><td>{acceptance}</td><td>{time}</td><td>{cost}</td><td>{role}</td></tr>
            ))}</tbody>
          </table>
        </div>
        <div className="matrix-note"><strong>Cost remains provisional.</strong><p>Saved Pi telemetry totaled $0.5933 while the observed account decrease was about $2.50.</p></div>
      </section>

      <section className="lab-section" id="pipeline">
        <div className="lab-section-head">
          <div><p>03 / Orchestration application</p><h2>The workflow is a chain of evidence.</h2></div>
          <p>Planning, bounded execution, review, and integration remain separate. Each handoff is a saved artifact rather than a conversational promise.</p>
        </div>
        <div className="pipeline" aria-label="Evidence pipeline">
          <article><span>Plan</span><strong>Codex + frontier model</strong><p>Interfaces, risks, ownership, acceptance checks.</p></article>
          <i aria-hidden="true">→</i>
          <article><span>Execute</span><strong>Qwen / GLM workers</strong><p>Bounded, testable, non-overlapping work.</p></article>
          <i aria-hidden="true">→</i>
          <article><span>Challenge</span><strong>Claude review</strong><p>Independent review for high-impact changes.</p></article>
          <i aria-hidden="true">→</i>
          <article><span>Integrate</span><strong>Codex final gate</strong><p>Full verification and residual-risk report.</p></article>
        </div>
      </section>

      <section className="lab-audit" id="audit">
        <div><p>04 / Portable audit extension</p><h2>Verification can travel with the repository.</h2><p>The read-only MCP extension exposes task contracts and run integrity while protecting private tests and rejecting traversal, extra arguments, and unknown tools.</p></div>
        <div className="audit-terminal" aria-label="Audit extension verification summary">
          <span>$ npm run benchmark:mcp:test</span>
          <strong>4 tests passed</strong>
          <p>read-only tools · private checks protected · traversal rejected · no side effects</p>
        </div>
      </section>

      <section className="lab-section lab-demo" id="demo">
        <div className="lab-section-head"><div><p>05 / Guided walkthrough</p><h2>A five-step audience demo.</h2></div><p>The sequence moves from the research question to visible evidence and ends with an operating decision.</p></div>
        <ol>{demoSteps.map(([number, title, copy]) => <li key={number}><span>{number}</span><div><strong>{title}</strong><p>{copy}</p></div></li>)}</ol>
        <div className="lab-downloads"><a href={sitePath("/presentation-deck.pptx")}>Download the presentation deck</a><a href={sitePath("/research-paper.pdf")}>Read the research paper</a></div>
      </section>

      <footer className="lab-footer"><strong>Coding Intelligence Field Study</strong><p>Synthetic tasks and demonstration data. Evidence-backed, not universally ranked.</p><a href={sitePath("/")}>Return to the main study</a></footer>
    </main>
  );
}
