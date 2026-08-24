"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type Metric = "quality" | "time" | "cost";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const sitePath = (path: string) => `${basePath}${path}`;

const assistants = [
  {
    code: "CX",
    name: "Codex",
    role: "Lead and integrator",
    verdict: "Best default lead in this study",
    evidence: "99 on the frontier incident in 129.209 seconds with no permission churn.",
    use: "Plan, implement, integrate, and run the final gate.",
  },
  {
    code: "CC",
    name: "Claude Code",
    role: "Reviewer and alternate lead",
    verdict: "Strongest independent challenger",
    evidence: "Found two high-severity workflow defects after local checks were green.",
    use: "Challenge plans and perform fresh high-risk reviews.",
  },
  {
    code: "OC",
    name: "OpenCode",
    role: "Open-model worker",
    verdict: "Worth keeping as a secondary tool",
    evidence: "Kimi scored 100 on T4; Qwen shipped a bounded T7 component unchanged.",
    use: "Route hosted open models to narrow, independently testable tasks.",
  },
  {
    code: "PI",
    name: "Pi",
    role: "Neutral model harness",
    verdict: "The laboratory, not the product winner",
    evidence: "Held tools and prompts fixed across 20 Phase 2 observations.",
    use: "Compare models without mixing in assistant-product differences.",
  },
];

const phaseTwoModels = [
  {
    label: "Sol",
    full: "GPT-5.6 Sol",
    maker: "OpenAI",
    score: 100,
    acceptance: "3/3",
    time: 333.389,
    cost: 0.0808,
    qualityBar: 100,
    timeBar: 80,
    costBar: 22,
    role: "Planner",
  },
  {
    label: "GLM",
    full: "GLM 5.2",
    maker: "Z.ai",
    score: 100,
    acceptance: "3/3",
    time: 744.357,
    cost: 0.0562,
    qualityBar: 100,
    timeBar: 37,
    costBar: 16,
    role: "Hard-task worker",
  },
  {
    label: "Fable",
    full: "Claude Fable 5",
    maker: "Anthropic",
    score: 99.8,
    acceptance: "3/3",
    time: 241.862,
    cost: 0.3644,
    qualityBar: 99.8,
    timeBar: 100,
    costBar: 100,
    role: "Speed premium",
  },
  {
    label: "Qwen",
    full: "Qwen3.8-27B",
    maker: "Qwen",
    score: 98.8,
    acceptance: "3/3",
    time: 621.744,
    cost: 0.016,
    qualityBar: 98.8,
    timeBar: 45,
    costBar: 5,
    role: "Economical worker",
  },
  {
    label: "Kimi",
    full: "Kimi K3",
    maker: "Moonshot AI",
    score: 68.75,
    acceptance: "1/3",
    time: 1178.618,
    cost: 0.076,
    qualityBar: 68.75,
    timeBar: 23,
    costBar: 21,
    role: "Experimental",
  },
];

const metricCopy: Record<Metric, { label: string; note: string }> = {
  quality: {
    label: "Strict weighted score",
    note: "Sol and GLM tied at 100. Kimi remains penalized for the counted timeout even though its saved patch later scored 95.",
  },
  time: {
    label: "Relative completion speed",
    note: "Fable was the fastest reliable route. Kimi was fast on T10, but its T9 timeout dominates the complete lane.",
  },
  cost: {
    label: "Relative Pi-reported cost",
    note: "Qwen had the lowest saved Pi telemetry. The account-level balance change was higher, so route-level costs remain provisional.",
  },
};

const phaseOneEvidence = [
  {
    eyebrow: "Frontier incident",
    title: "Codex + Sol",
    score: "99",
    time: "129.209 s",
    copy: "Fastest accepted frontier repair with the smallest disciplined trace.",
  },
  {
    eyebrow: "Independent review",
    title: "Claude + Opus",
    score: "97",
    time: "228.453 s",
    copy: "Broader tests and careful analysis, with more permission friction.",
  },
  {
    eyebrow: "Shared open model",
    title: "OpenCode + Kimi K2.7",
    score: "99",
    time: "55.115 s",
    copy: "Fastest fixed-model harness result; all eight private checks passed.",
  },
];

const tools = [
  ["Assistants", "Codex, Claude Code, OpenCode, Pi"],
  ["Frontier models", "GPT-5.6 Sol and Terra, Claude Opus, Sonnet, Fable"],
  ["Open models", "Kimi K2.7 and K3, Qwen3.8-27B, DeepSeek V4, GLM 5.2"],
  ["Model access", "OpenRouter, Ollama Cloud, subscription routes"],
  ["Evidence harness", "Git worktrees, frozen prompts, JSON manifests, patches"],
  ["Verification", "Visible tests, private suites, browser QA, scope checks"],
  ["Portability", "AGENTS.md, skills, read-only MCP, repository scripts"],
  ["Showcase", "Next-compatible app, Vinext build, synthetic trade workspace"],
];

const navItems = [
  ["story", "Study"],
  ["study-flow", "Flow"],
  ["assistants", "Assistants"],
  ["phase-one", "Phase 1"],
  ["phase-two", "Phase 2"],
  ["applications", "Applications"],
  ["orchestration", "Workflow"],
  ["methods", "Methods"],
];

export default function Home() {
  const [metric, setMetric] = useState<Metric>("quality");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(100, (window.scrollY / height) * 100) : 0);
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  const rankedModels = useMemo(() => {
    const key = metric === "quality" ? "qualityBar" : metric === "time" ? "timeBar" : "costBar";
    return [...phaseTwoModels].sort((a, b) => b[key] - a[key]);
  }, [metric]);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to the research</a>
      <div className="reading-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <header className="research-header">
        <a className="research-brand" href="#top" aria-label="Coding Intelligence Field Study home">
          <span>CI</span>
          <strong>Coding Intelligence / Field Study</strong>
        </a>
        <nav aria-label="Research sections">
          {navItems.map(([id, label]) => <a href={`#${id}`} key={id}>{label}</a>)}
        </nav>
        <a className="header-paper-link" href={sitePath("/research-paper.pdf")}>Research paper <span>PDF</span></a>
      </header>

      <main id="main-content">
        <section className="research-hero" id="top">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-copy">
            <p className="overline">Two-phase applied research / August 2026</p>
            <h1>How coding assistants <em>actually</em> differ.</h1>
            <p className="hero-lede">
              A reproducible field study of Codex, Claude Code, OpenCode, frontier
              models, open-weight workers, neutral harnesses, and distributed AI development.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#story">Explore the evidence</a>
              <a className="button button-secondary" href={sitePath("/lab/")}>Enter the research lab</a>
            </div>
          </div>

          <aside className="hero-finding" aria-label="Principal finding">
            <span className="finding-index">01</span>
            <p className="finding-label">Principal finding</p>
            <p className="finding-quote">
              The strongest setup is a portfolio, not a winner.
            </p>
            <div className="finding-rule" />
            <p>
              Codex leads. Claude challenges. OpenCode routes bounded workers.
              Pi keeps the model comparison honest.
            </p>
          </aside>

          <div className="hero-stats" aria-label="Study totals">
            <div><strong>3</strong><span>primary coding assistants</span></div>
            <div><strong>2</strong><span>completed research phases</span></div>
            <div><strong>20</strong><span>neutral Phase 2 observations</span></div>
            <div><strong>5</strong><span>models in the fixed Pi harness</span></div>
          </div>
        </section>

        <section className="narrative-section" id="story">
          <div className="section-intro">
            <p className="section-kicker">01 / The study</p>
            <h2>Separate the product from the model.</h2>
            <p>
              Phase 1 measured the complete assistant experience. Phase 2 held Pi
              constant and changed only the model route. Between them, the study
              distinguishes product advantage, model capability, and workflow design.
            </p>
          </div>

          <div className="study-map" aria-label="Two phase study map">
            <article className="map-node map-node-primary">
              <span>Phase 1</span>
              <strong>Assistant products</strong>
              <p>Planning, permissions, tools, plugins, integration, and distributed work.</p>
              <small>Codex · Claude Code · OpenCode</small>
            </article>
            <div className="map-bridge">
              <span>Evidence handoff</span>
              <i aria-hidden="true" />
              <b>Trade capture system</b>
            </div>
            <article className="map-node">
              <span>Phase 2</span>
              <strong>Models in one harness</strong>
              <p>Analysis, bounded implementation, and concurrent debugging.</p>
              <small>Sol · Fable · GLM · Qwen · Kimi</small>
            </article>
          </div>

          <div className="research-question-grid">
            <article><span>Q1</span><h3>Which assistant should lead?</h3><p>Codex was the strongest default integrator; Claude was the strongest independent reviewer.</p></article>
            <article><span>Q2</span><h3>Is OpenCode worth it?</h3><p>Yes, when model flexibility and bounded open-model work matter more than native polish.</p></article>
            <article><span>Q3</span><h3>Can cheaper models implement?</h3><p>Yes. Qwen and GLM passed hard tasks inside Pi, provided the work was explicit and verifiable.</p></article>
            <article><span>Q4</span><h3>Should every task be distributed?</h3><p>No. Distribution improves separation and auditability, but the measured route was 3.57× slower than solo Codex.</p></article>
          </div>
        </section>

        <section className="study-flow-section" id="study-flow">
          <div className="section-intro split-intro">
            <div><p className="section-kicker">02 / End-to-end study flow</p><h2>Every conclusion came through a controlled evidence chain.</h2></div>
            <p>Follow the complete sequence from setup and frozen controls through every Phase 1 task, all 20 neutral Phase 2 observations, and the final operating recommendation.</p>
          </div>

          <div className="flow-foundation" aria-label="Study foundation">
            <article><span>01</span><strong>Research scope</strong><p>Separate assistant-product behavior from underlying model capability.</p></article>
            <article><span>02</span><strong>Access and budgets</strong><p>Authenticate subscriptions, hosted routes, permissions, and spend ceilings.</p></article>
            <article><span>03</span><strong>Frozen contracts</strong><p>Name the baseline, prompt, rubric, allowed paths, timeouts, and run order.</p></article>
            <article><span>04</span><strong>Evidence controls</strong><p>Isolated worktrees, visible and private checks, patches, and labeled telemetry.</p></article>
          </div>

          <div className="flow-connector" aria-hidden="true"><span>↓</span><b>Assistant-product evaluation</b></div>

          <article className="flow-phase flow-phase-one">
            <header><div><span>Phase 1</span><h3>Assistants as complete products</h3></div><p>Codex · Claude Code · OpenCode · early Pi pilot</p></header>
            <div className="flow-task-rail" aria-label="Phase 1 task sequence">
              <article><span>T1</span><strong>Repository map</strong><p>Read-only architecture, request flow, risks, and change plan.</p></article>
              <article><span>T2</span><strong>Invalid-run filter</strong><p>One-file bug fix and exact scope control.</p></article>
              <article><span>T3</span><strong>Comparison summary</strong><p>Multi-file logic, edge cases, rendering, and tests.</p></article>
              <article><span>T4</span><strong>Run explorer</strong><p>Responsive interface, filters, sorting, summaries, and accessibility.</p></article>
              <article><span>T5</span><strong>Review queue</strong><p>Controlled distributed build versus solo Codex.</p></article>
              <article><span>T6</span><strong>Cache incident</strong><p>Concurrency, failed-load cleanup, recovery, and regression evidence.</p></article>
              <article><span>T7</span><strong>Trade capture</strong><p>Realistic distributed product build and independent review.</p></article>
            </div>

            <div className="flow-detail-grid">
              <details>
                <summary><span>T5 internal workflow</span><strong>Five handoffs plus a solo control</strong></summary>
                <div className="flow-mini-chain">
                  <article><span>Plan</span><strong>Codex + Sol</strong><p>Freeze architecture, ownership, and acceptance checks.</p></article>
                  <i aria-hidden="true">→</i>
                  <article><span>Challenge</span><strong>Claude + Opus</strong><p>Identify blocking gaps before implementation.</p></article>
                  <i aria-hidden="true">→</i>
                  <article><span>Build</span><strong>OpenCode + Kimi</strong><p>Implement exactly the owned files.</p></article>
                  <i aria-hidden="true">→</i>
                  <article><span>Integrate</span><strong>Codex</strong><p>Apply the patch and run the complete gate.</p></article>
                  <i aria-hidden="true">→</i>
                  <article><span>Review</span><strong>Claude</strong><p>Perform an independent final assessment.</p></article>
                </div>
                <p className="flow-control-note"><strong>Control:</strong> solo Codex completed the same task for the score-and-time comparison.</p>
              </details>

              <details>
                <summary><span>T7 internal workflow</span><strong>Architecture, four workers, integration, and repair</strong></summary>
                <div className="flow-plan-review"><article><span>Architecture</span><strong>Codex + Sol</strong></article><i>→</i><article><span>Challenge</span><strong>Claude + Opus</strong></article></div>
                <div className="flow-worker-grid">
                  <article><span>Domain</span><strong>Codex + Terra</strong><p>Types, calculations, validation, lifecycle, seed data, and tests.</p></article>
                  <article><span>Ticket</span><strong>Claude + Sonnet</strong><p>Accessible securitized-products trade entry.</p></article>
                  <article><span>Insights</span><strong>OpenCode + Qwen</strong><p>Small desk exposure and activity component.</p></article>
                  <article><span>Workspace</span><strong>OpenCode + Kimi</strong><p>State, blotter, review surface, and visual system.</p></article>
                </div>
                <div className="flow-integration-line"><span>↓</span><strong>Codex + Sol integration</strong><span>→</span><strong>Claude + Opus review</strong><span>→</span><strong>Codex repair and browser gate</strong></div>
              </details>

              <div className="flow-portable-extension"><span>Portable extension</span><strong>Canonical audit workflow + assistant skills + read-only MCP</strong><p>Tested across Codex, Claude Code, and OpenCode without exposing private checks or mutating evidence.</p></div>
            </div>
          </article>

          <div className="flow-handoff"><span>Phase 1 conclusion</span><strong>The assistant product and the underlying model must be measured separately.</strong><i aria-hidden="true">↓</i></div>

          <article className="flow-phase flow-phase-two">
            <header><div><span>Phase 2</span><h3>Five models in one neutral Pi harness</h3></div><p>Sol · Fable · GLM · Qwen · Kimi</p></header>

            <div className="flow-model-chips" aria-label="Phase 2 model routes"><span>GPT-5.6 Sol</span><span>Claude Fable 5</span><span>GLM 5.2</span><span>Qwen3.8-27B</span><span>Kimi K3</span></div>

            <div className="flow-neutral-loop">
              <strong>Repeated for every counted observation</strong>
              <ol>
                <li><span>01</span>Fresh Pi session</li>
                <li><span>02</span>Clean isolated worktree</li>
                <li><span>03</span>Same prompt, tools, and provider</li>
                <li><span>04</span>Early-edit requirement</li>
                <li><span>05</span>Fixed timeout and zero intervention</li>
                <li><span>06</span>Save patch, output, errors, and telemetry</li>
                <li><span>07</span>Visible tests, private checks, and scope audit</li>
              </ol>
            </div>

            <div className="flow-task-rail flow-phase-two-rail" aria-label="Phase 2 task sequence">
              <article><span>T8 · 5 runs</span><strong>Change-impact analysis</strong><p>One read-only planning observation per model. Weight: 20%.</p></article>
              <article><span>T9 · 5 runs</span><strong>Capacity allocation</strong><p>One bounded implementation per model. Weight: 30%.</p></article>
              <article><span>T10 · observation 1</span><strong>Event projector</strong><p>Concurrency and recovery debugging for every model.</p></article>
              <article><span>T10 · observation 2</span><strong>Preregistered repeat</strong><p>A second counted observation for every model. Mean weight: 50%.</p></article>
            </div>

            <div className="flow-score-line"><span>20 counted observations</span><i>→</i><span>Frozen weighted score</span><i>→</i><span>Time, cost, reliability</span><i>→</i><span>Audit and report</span></div>
          </article>

          <div className="flow-synthesis">
            <div><span>Cross-phase synthesis</span><h3>Frontier judgment at the top. Economical execution underneath.</h3></div>
            <div className="flow-synthesis-chain"><span>Sol plans</span><i>→</i><span>Qwen / GLM build</span><i>→</i><span>Claude challenges</span><i>→</i><span>Codex integrates</span></div>
            <div className="flow-output-list"><span>Research website</span><span>Research Lab</span><span>Trade-capture application</span><span>Research paper</span><span>Presentation deck</span></div>
          </div>
        </section>

        <section className="dark-section" id="assistants">
          <div className="section-intro section-intro-light">
            <p className="section-kicker">03 / The assistants</p>
            <h2>Four tools. Four different jobs.</h2>
            <p>The assistant is the system around the model: tools, permissions, context, orchestration, and developer experience.</p>
          </div>

          <div className="assistant-showcase">
            {assistants.map((assistant, index) => (
              <article className="assistant-result" key={assistant.name}>
                <div className="assistant-number">0{index + 1}</div>
                <div className="assistant-identity"><span>{assistant.code}</span><p>{assistant.role}</p></div>
                <h3>{assistant.name}</h3>
                <strong>{assistant.verdict}</strong>
                <p>{assistant.evidence}</p>
                <div className="assistant-use"><span>Best use</span><p>{assistant.use}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="narrative-section" id="phase-one">
          <div className="section-intro split-intro">
            <div><p className="section-kicker">04 / Phase 1</p><h2>Products under real development pressure.</h2></div>
            <p>
              The work moved from repository analysis to bugs, interfaces, a cache incident,
              cross-assistant tooling, and a securitized-products trade-capture system.
            </p>
          </div>

          <div className="evidence-cards">
            {phaseOneEvidence.map((item) => (
              <article key={item.title}>
                <span>{item.eyebrow}</span>
                <h3>{item.title}</h3>
                <div className="evidence-numbers"><strong>{item.score}</strong><small>{item.time}</small></div>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>

          <div className="distributed-proof">
            <div className="proof-copy">
              <p className="section-kicker">Measured distributed workflow</p>
              <h3>Correct, auditable—and 3.57× slower.</h3>
              <p>
                Codex planned, Claude challenged, OpenCode implemented with Kimi,
                Codex integrated, and Claude reviewed. The route scored 100 with
                zero frontier repair, but took 536.704 seconds versus 150.206 seconds for solo Codex.
              </p>
            </div>
            <div className="proof-bars" aria-label="Distributed workflow time comparison">
              <div><span>Distributed</span><i style={{ width: "100%" }} /><strong>536.704 s</strong></div>
              <div><span>Solo Codex</span><i style={{ width: "28%" }} /><strong>150.206 s</strong></div>
            </div>
          </div>
        </section>

        <section className="model-section" id="phase-two">
          <div className="section-intro split-intro">
            <div><p className="section-kicker">05 / Phase 2</p><h2>Five models. One neutral Pi harness.</h2></div>
            <p>
              Same baseline, prompts, tools, provider, timeouts, and zero-intervention policy.
              Only the model route changed across 20 counted observations.
            </p>
          </div>

          <div className="metric-switcher" role="group" aria-label="Choose model comparison metric">
            {(["quality", "time", "cost"] as Metric[]).map((item) => (
              <button type="button" key={item} aria-pressed={metric === item} onClick={() => setMetric(item)}>{item}</button>
            ))}
          </div>

          <div className="metric-board">
            <div className="metric-board-head"><strong>{metricCopy[metric].label}</strong><p>{metricCopy[metric].note}</p></div>
            <div className="metric-bars">
              {rankedModels.map((model, index) => {
                const width = metric === "quality" ? model.qualityBar : metric === "time" ? model.timeBar : model.costBar;
                const value = metric === "quality" ? model.score.toFixed(model.score % 1 ? 1 : 0) : metric === "time" ? `${model.time.toFixed(3)} s` : `$${model.cost.toFixed(4)}`;
                return (
                  <div className="metric-row" key={model.label}>
                    <span className="metric-rank">0{index + 1}</span>
                    <div className="metric-name"><strong>{model.full}</strong><span>{model.role}</span></div>
                    <div className="metric-track"><i style={{ "--bar-width": `${width}%` } as CSSProperties} /></div>
                    <strong className="metric-value">{value}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="table-shell" role="region" aria-label="Phase 2 model results" tabIndex={0}>
            <table>
              <thead><tr><th>Model route</th><th>Strict score</th><th>Write acceptance</th><th>Total time</th><th>Pi-reported cost</th><th>Recommended role</th></tr></thead>
              <tbody>
                {phaseTwoModels.map((model) => (
                  <tr key={model.label}>
                    <td><strong>{model.full}</strong><span>{model.maker}</span></td>
                    <td>{model.score}</td><td>{model.acceptance}</td><td>{model.time.toFixed(3)} s</td><td>${model.cost.toFixed(4)}</td><td>{model.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cost-reconciliation">
            <div><span>Saved Pi telemetry</span><strong>$0.5933</strong></div>
            <div className="cost-plus">≠</div>
            <div><span>Observed account decrease</span><strong>≈ $2.50</strong></div>
            <p>The $1.9067 difference cannot be allocated by model. Per-route cost rankings are provisional; the account balance is the safer budget figure.</p>
          </div>
        </section>

        <section className="application-section" id="applications">
          <div className="section-intro split-intro">
            <div><p className="section-kicker">06 / Applications built</p><h2>The evidence became working software.</h2></div>
            <p>The research produced more than scores: a live trade system, a neutral comparison harness, a benchmark orchestrator, and a portable read-only audit extension.</p>
          </div>
          <div className="application-feature">
            <div className="application-feature-copy"><span>Live application</span><h3>Securitized-products trade capture</h3><p>Capture, validate, book, review, filter, and cancel synthetic trades inside the artifact produced by the distributed workflow.</p><a href={sitePath("/trade-capture/")}>Launch the application <b aria-hidden="true">↗</b></a></div>
            <div className="application-feature-stats" aria-label="Trade application capabilities"><span><strong>6</strong> lifecycle actions</span><span><strong>5</strong> synthetic active trades</span><span><strong>0</strong> external systems connected</span></div>
          </div>
          <div className="application-links">
            <a href={sitePath("/lab/")}><span>Research lab</span><strong>Explore every application layer</strong><b>Open lab ↗</b></a>
            <a href={sitePath("/presentation-deck.pptx")}><span>Presentation</span><strong>Download the guided audience deck</strong><b>PowerPoint ↓</b></a>
            <a href={sitePath("/research-paper.pdf")}><span>Publication</span><strong>Read the complete research paper</strong><b>PDF ↓</b></a>
          </div>
        </section>

        <section className="orchestration-section" id="orchestration">
          <div className="section-intro section-intro-light">
            <p className="section-kicker">07 / Recommended operating model</p>
            <h2>Frontier judgment at the top. Economical execution underneath.</h2>
            <p>This architecture combines the strongest observed product and model behaviors without pretending every task needs a committee.</p>
          </div>

          <div className="workflow-diagram" aria-label="Recommended two-level coding workflow">
            <article className="workflow-node workflow-lead"><span>01 / Plan</span><strong>Codex + Sol</strong><p>Define interfaces, risk, ownership, and executable acceptance checks.</p></article>
            <div className="workflow-branch" aria-hidden="true"><i /><i /><i /></div>
            <div className="workflow-workers">
              <article className="workflow-node"><span>02A / Build</span><strong>Qwen worker</strong><p>Small bounded component with a fast test.</p></article>
              <article className="workflow-node"><span>02B / Build</span><strong>GLM worker</strong><p>Hard asynchronous unit where latency is acceptable.</p></article>
              <article className="workflow-node"><span>02C / Challenge</span><strong>Claude review</strong><p>Independent risk review for high-impact changes.</p></article>
            </div>
            <div className="workflow-merge" aria-hidden="true"><i /><span>Evidence handoff: patches · tests · reports</span></div>
            <article className="workflow-node workflow-finish"><span>03 / Integrate</span><strong>Codex final gate</strong><p>Resolve conflicts, run the complete suite, inspect behavior, and report residual risk.</p></article>
          </div>

          <div className="workflow-rule"><strong>Control rule</strong><p>Keep assignments non-overlapping. Require an early edit, fixed timeout, saved patch, private verification, and frontier fallback.</p></div>
        </section>

        <section className="narrative-section" id="methods">
          <div className="section-intro split-intro">
            <div><p className="section-kicker">08 / Methods and tools</p><h2>Evidence before impressions.</h2></div>
            <p>Every conclusion traces back to a named baseline, frozen prompt, patch, verification record, timing, and explicitly labeled cost field.</p>
          </div>

          <div className="harness-diagram" aria-label="Neutral benchmark harness">
            <div className="model-inputs">{["Sol", "Fable", "Kimi", "Qwen", "GLM"].map((name) => <span key={name}>{name}</span>)}</div>
            <div className="harness-arrow" aria-hidden="true">↓</div>
            <div className="harness-core"><span>Fixed control surface</span><strong>Pi 0.84.2</strong><p>Same prompt · same tools · same provider · fresh session</p></div>
            <div className="harness-arrow" aria-hidden="true">↓</div>
            <div className="harness-output">
              <span>Isolated Git worktree</span><span>Visible + private tests</span><span>Patch + telemetry</span><span>Audit report</span>
            </div>
          </div>

          <div className="tool-ledger">
            {tools.map(([label, value]) => <article key={label}><span>{label}</span><p>{value}</p></article>)}
          </div>

          <div className="method-principles">
            <article><strong>Same start</strong><p>Clean named commit in an isolated worktree.</p></article>
            <article><strong>Same prompt</strong><p>Versioned, hashed, and frozen before execution.</p></article>
            <article><strong>Private checks</strong><p>Hidden from the model and preserved after failure.</p></article>
            <article><strong>Honest telemetry</strong><p>Subscription, API, and provider fields never treated as interchangeable.</p></article>
          </div>
        </section>

        <section className="closing-section">
          <div className="closing-copy">
            <p className="section-kicker">Conclusion</p>
            <h2>Build a team of roles, not a leaderboard of brands.</h2>
            <p>
              Codex is the default lead. Claude is the independent reviewer.
              OpenCode is the flexible worker harness. Pi is the neutral lab.
              Sol plans; Qwen executes cheaply; GLM handles hard asynchronous work;
              Fable buys speed; Kimi stays guarded until completion is more reliable.
            </p>
            <div className="hero-actions">
              <a className="button button-light" href={sitePath("/research-paper.pdf")}>Read the research paper</a>
              <a className="button button-outline-light" href={sitePath("/lab/")}>Explore the research lab</a>
            </div>
          </div>
          <div className="limits-card">
            <span>Read with care</span>
            <ul>
              <li>Most Phase 1 routes ran once.</li>
              <li>Only Phase 2&apos;s T10 task was repeated.</li>
              <li>Synthetic tasks show observed behavior, not universal rank.</li>
              <li>The OpenRouter balance did not reconcile to saved Pi cost telemetry.</li>
              <li>The trade-capture workspace is a synthetic mock, not production financial software.</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="research-footer">
        <div><span>CI / 2026</span><strong>Coding Intelligence Field Study</strong></div>
        <p>Audited local evidence · 3 assistants · 5 neutral model routes · 20 Phase 2 observations</p>
        <div className="footer-links"><a href={sitePath("/lab/")}>Research lab</a><a href={sitePath("/research-paper.pdf")}>PDF paper</a><a href={sitePath("/trade-capture/")}>Trade capture</a><a href="#top">Back to top</a></div>
      </footer>
    </>
  );
}
