"use client";

import { useEffect, useMemo, useState } from "react";

const assistantCards = [
  {
    name: "Codex",
    role: "Lead / integrator",
    mark: "CX",
    summary:
      "The best default lead in this study. It combined strong accepted results with the cleanest integration behavior and the fastest T6 frontier run.",
    test: "App and CLI flow, worktrees, custom agents, skills, plugins, MCP, hooks, approvals, structured non-interactive output.",
  },
  {
    name: "Claude Code",
    role: "Reviewer / alternate lead",
    mark: "CC",
    summary:
      "The strongest independent reviewer observed. It found useful plan gaps and wrote careful evidence, though narrow permissions needed more setup.",
    test: "Plan mode, subagents, agent view, agent teams, worktrees, plugin marketplace, hooks, MCP, permissions, print/JSON mode.",
  },
  {
    name: "OpenCode",
    role: "Open-model worker",
    mark: "OC",
    summary:
      "Worth keeping as a strong secondary tool. Its provider flexibility is real: Qwen passed a bounded T7 task, while the broader Kimi task exposed a timeout risk.",
    test: "Provider switching, Ollama discovery, agents, skills, MCP, plugins, permissions, session handling, run/server modes.",
  },
  {
    name: "Pi",
    role: "Neutral lab bench",
    mark: "PI",
    summary:
      "Use Pi to compare models inside one minimal harness. It supports your OpenAI and Anthropic subscriptions plus custom local providers.",
    test: "Model portability, extensions, skills, packages, JSON/RPC/SDK modes, session branching, and the cost of adding missing controls.",
  },
];

const resultRows = [
  {
    task: "T4 interface",
    route: "OpenCode + Kimi K3",
    score: "100",
    time: "221.644 s",
    note: "Fastest accepted top-native route",
  },
  {
    task: "T4 interface",
    route: "Codex + GPT-5.6 Sol",
    score: "100",
    time: "350.694 s",
    note: "Fewest tool calls among the successful routes",
  },
  {
    task: "T4 interface",
    route: "Claude Code + Opus 5",
    score: "100",
    time: "483.388 s",
    note: "Largest test suite and strongest final evidence",
  },
  {
    task: "T4 interface",
    route: "OpenCode + Qwen3.8-27B",
    score: "87",
    time: "20 min cap",
    note: "Working interface, but the run timed out incomplete",
  },
  {
    task: "T6 incident",
    route: "Codex + GPT-5.6 Sol",
    score: "99",
    time: "129.209 s",
    note: "Faster, smaller, more disciplined tool trace",
  },
  {
    task: "T6 incident",
    route: "Claude Code + Opus 5",
    score: "97",
    time: "228.453 s",
    note: "Broader tests, with ten permission denials",
  },
  {
    task: "T6 shared model",
    route: "OpenCode + Kimi K2.7",
    score: "99",
    time: "55.115 s",
    note: "Fastest fixed-model harness; one denied command",
  },
  {
    task: "T6 shared model",
    route: "Claude Code + Kimi K2.7",
    score: "98",
    time: "78.832 s",
    note: "Second-fastest; two denied lint attempts",
  },
  {
    task: "T6 shared model",
    route: "Codex + Kimi K2.7",
    score: "98",
    time: "93.662 s",
    note: "Accepted, with noisy Ollama adapter telemetry",
  },
  {
    task: "T7 domain",
    route: "Codex + GPT-5.6 Terra",
    score: "Behavioral pass",
    time: "161.146 s",
    note: "Source passed; raw failure preserved a harness defect",
  },
  {
    task: "T7 ticket",
    route: "Claude Code + Sonnet 5",
    score: "Behavioral pass",
    time: "1,085.797 s",
    note: "Source passed; raw failure preserved a grader defect",
  },
  {
    task: "T7 insights",
    route: "OpenCode + Qwen3.8-27B",
    score: "Pass",
    time: "181.703 s",
    note: "Exact bounded patch; $0.1072 metered",
  },
  {
    task: "T7 workspace",
    route: "OpenCode + Kimi K3",
    score: "Timeout",
    time: "30 min cap",
    note: "Planned but wrote no files; Codex supplied six-file fallback",
  },
];

const modelRows = [
  {
    model: "GPT-5.6 Sol",
    maker: "OpenAI",
    lane: "Frontier",
    access: "Codex subscription; API optional",
    use: "Top-level planning, hardest fixes, final review",
    priority: "Required",
  },
  {
    model: "GPT-5.6 Terra",
    maker: "OpenAI",
    lane: "Efficient frontier",
    access: "Codex subscription where listed; API optional",
    use: "Exploration, review, medium-complexity worker",
    priority: "Required",
  },
  {
    model: "GPT-5.6 Luna",
    maker: "OpenAI",
    lane: "Low cost",
    access: "API or catalog access",
    use: "Simple scans, formatting, repetitive checks",
    priority: "Optional",
  },
  {
    model: "Claude Opus 5",
    maker: "Anthropic",
    lane: "Frontier",
    access: "Claude subscription, plan dependent",
    use: "Top-level planning, long work, difficult review",
    priority: "Required",
  },
  {
    model: "Claude Sonnet 5",
    maker: "Anthropic",
    lane: "Workhorse",
    access: "Claude Code subscription",
    use: "Daily coding baseline and moderate workers",
    priority: "Required",
  },
  {
    model: "Claude Fable 5",
    maker: "Anthropic",
    lane: "Frontier ceiling",
    access: "Usage credits / account availability",
    use: "One or two hardest runs only",
    priority: "Stretch",
  },
  {
    model: "Claude Haiku 4.5",
    maker: "Anthropic",
    lane: "Low cost",
    access: "API or subscription catalog",
    use: "Fast small worker and parallel scans",
    priority: "Optional",
  },
  {
    model: "Qwen3 Coder 480B Cloud",
    maker: "Qwen",
    lane: "Hosted open weight",
    access: "Ollama Cloud",
    use: "Optional third hosted coding model after the pilot",
    priority: "Optional",
  },
  {
    model: "Kimi K2.7 Code",
    maker: "Moonshot AI",
    lane: "Hosted open weight",
    access: "Ollama Cloud",
    use: "Long coding tasks and tool-heavy worker runs",
    priority: "Required",
  },
  {
    model: "DeepSeek V4 Flash",
    maker: "DeepSeek",
    lane: "Hosted open weight",
    access: "Ollama Cloud",
    use: "Long-context and cost-aware worker runs",
    priority: "Required",
  },
  {
    model: "Qwen3 8B",
    maker: "Qwen",
    lane: "Small local control",
    access: "Ollama",
    use: "Measure the quality and speed tradeoff of a laptop-sized worker",
    priority: "Optional",
  },
];

const benchmarkLanes = [
  {
    number: "01",
    title: "Compare the assistants",
    lock: "Keep the model fixed",
    body: "Run deepseek-v4-flash:cloud through Codex, Claude Code, OpenCode, and Pi. The same hosted model avoids turning laptop limits into an assistant advantage.",
    runs: "4 assistants × 4 tasks × 2 runs = 32",
    answers: "Which assistant plans better, uses tools better, stays in scope, recovers from errors, and needs fewer interventions?",
  },
  {
    number: "02",
    title: "Compare the models",
    lock: "Keep the assistant fixed",
    body: "Use Pi as the intended neutral harness after access is verified. Test the selected OpenAI and Anthropic models plus DeepSeek, Kimi, and an optional Qwen Cloud model with identical conditions.",
    runs: "7 models × 4 tasks × 2 runs = 56",
    answers: "Which model gives the best quality, time, and cost when the surrounding assistant is unchanged?",
  },
  {
    number: "03",
    title: "Compare real daily use",
    lock: "Use each native best pairing",
    body: "Run Codex + Sol, Claude Code + Opus or Sonnet, and OpenCode + the best open model from the pilot on two hard tasks.",
    runs: "3 native pairs × 2 tasks × 1 run = 6",
    answers: "Which full product would you choose when fairness matters less than getting the work done?",
  },
];

const taskRows = [
  {
    id: "T1",
    kind: "Core",
    title: "Understand an unfamiliar repository",
    setup: "Ask for an architecture map, main request flow, risky areas, and a short change plan. Read-only.",
    pass: "Matches a maintainer-written answer key; cites the right files; makes no edits.",
  },
  {
    id: "T2",
    kind: "Core",
    title: "Fix a real bug",
    setup: "Seed one edge-case bug with visible tests and hidden tests. Give only the issue report and reproduction.",
    pass: "All tests pass, the root cause is fixed, and the diff does not include unrelated cleanup.",
  },
  {
    id: "T3",
    kind: "Core",
    title: "Build a multi-file feature",
    setup: "Add one API or data feature that needs schema, business logic, validation, tests, and docs.",
    pass: "Acceptance tests pass; error paths work; existing behavior remains stable.",
  },
  {
    id: "T4",
    kind: "Core",
    title: "Build and verify a user interface",
    setup: "Provide a screenshot plus written behavior for desktop and mobile. Require keyboard use and browser verification.",
    pass: "Functional checks, visual checks, accessibility checks, and console checks pass.",
  },
  {
    id: "T5",
    kind: "Challenge",
    title: "Refactor without changing behavior",
    setup: "Give a large, awkward module and freeze behavior with characterization tests before the refactor.",
    pass: "Same public behavior, smaller clear units, no snapshot churn, and measured complexity improvement.",
  },
  {
    id: "T6",
    kind: "Challenge",
    title: "Upgrade a dependency or API",
    setup: "Pin an older library, provide current docs, and require a safe migration with a rollback note.",
    pass: "Build and tests pass; deprecated usage is gone; no unnecessary dependency changes.",
  },
  {
    id: "T7",
    kind: "Challenge",
    title: "Investigate an incident and a security flaw",
    setup: "Use a controlled fixture with logs, one vulnerable path, noise, and a safe reproduction.",
    pass: "Finds the real cause, ranks risk correctly, patches it, adds regression tests, and avoids unsafe actions.",
  },
  {
    id: "T8",
    kind: "Challenge",
    title: "Repair CI and improve project guidance",
    setup: "Give a broken pipeline, weak README, and missing assistant instructions.",
    pass: "CI passes; setup is reproducible; AGENTS.md is short, specific, and useful across assistants.",
  },
];

const scoreRows = [
  ["Correctness", "35", "Acceptance tests and hidden tests"],
  ["No regressions", "15", "Existing tests and behavior stay intact"],
  ["Scope discipline", "10", "Only necessary files and changes"],
  ["Code quality", "10", "Clear, maintainable, and consistent with the repo"],
  ["Autonomy", "8", "Few human corrections or repeated instructions"],
  ["Tool and safety discipline", "7", "Good permission choices; no risky shortcuts"],
  ["Time", "5", "Time to an accepted result, not time to first answer"],
  ["Usage or cost", "5", "Tokens, subscription quota, cloud units, or local energy proxy"],
  ["Explanation", "5", "Accurate summary, verification, and remaining risks"],
];

const extensionRows = [
  {
    surface: "Project rules",
    common: "Keep AGENTS.md as the single source. Claude's CLAUDE.md should import it with @AGENTS.md.",
    measure: "Rule following and context size",
  },
  {
    surface: "Skills",
    common: "Reuse one small SKILL.md workflow through each assistant's discovery path.",
    measure: "Portability, setup time, and quality gain",
  },
  {
    surface: "MCP",
    common: "Configure the same read-only docs or issue-tracker server in each assistant.",
    measure: "Connection reliability, tool accuracy, permission clarity",
  },
  {
    surface: "Hooks and guards",
    common: "Apply the same policy: block secrets, format changed files, and run a focused check after edits.",
    measure: "Coverage, false blocks, debuggability",
  },
  {
    surface: "Plugins and extensions",
    common: "Package the rule, skill, tool, and guard only after the loose version works.",
    measure: "Install, update, permissions, versioning, and removal",
  },
];

const stages = [
  {
    id: "stage-0",
    week: "Day 1",
    title: "Freeze the study",
    goal: "Write the question before seeing results.",
    items: [
      "Create STUDY.md with the three comparison lanes, the scorecard, and your stop rules.",
      "Record machine, operating system, RAM/VRAM, assistant versions, model IDs, and subscription tier.",
      "Turn off auto-updates for the study window where practical, or record every update as a new study block.",
      "Set a hard optional-spend cap. Start with subscriptions and Ollama; add paid API runs only after the pilot.",
    ],
  },
  {
    id: "stage-1",
    week: "Days 2–4",
    title: "Build the task pack",
    goal: "Make the result gradeable without model judgment.",
    items: [
      "Prepare T1–T4 first. Use small real repositories or frozen fixtures with clean reset commits.",
      "Write visible acceptance criteria and separate hidden tests before any assistant sees the task.",
      "Create one prompt per task. Do not mention the assistant or model name inside the prompt.",
      "Manually solve each task once so you know it is possible and know the expected effort.",
    ],
  },
  {
    id: "stage-2",
    week: "Days 5–7",
    title: "Build the runner",
    goal: "Capture the same evidence for every run.",
    items: [
      "Start each run from the same Git commit in its own worktree.",
      "Wrap codex exec, claude -p, opencode run, and Pi print/JSON mode behind one run command.",
      "Save prompt, settings, stdout, stderr, event log, patch, tests, elapsed time, interventions, and final answer.",
      "Use a run ID and never overwrite a prior run.",
    ],
  },
  {
    id: "stage-3",
    week: "Week 2",
    title: "Run the 28-run pilot",
    goal: "Find broken tasks and weak candidates cheaply.",
    items: [
      "Assistant pilot: 4 assistants × T1 and T2 × 1 run = 8.",
      "Model pilot: 7 models in Pi × T1 and T2 × 1 run = 14.",
      "Native pilot: 3 native pairings × T1 and T2 × 1 run = 6.",
      "Fix the harness, prompts, or hidden tests only if the issue affects everyone. Version every change.",
    ],
  },
  {
    id: "stage-4",
    week: "Weeks 3–4",
    title: "Complete the 94-run core study",
    goal: "Collect repeatable evidence, not impressions.",
    items: [
      "Complete the assistant lane: 32 total runs across T1–T4.",
      "Complete the model lane: 56 total runs across T1–T4.",
      "Complete the native lane: 6 runs on two challenge tasks.",
      "Randomize run order, clear sessions, restore the repository, and grade before revealing model identity where possible.",
    ],
  },
  {
    id: "stage-5",
    week: "Week 5",
    title: "Test the extension ecosystems",
    goal: "Measure what customization actually buys you.",
    items: [
      "Run one task with no extensions, then with a shared rule, one skill, one MCP server, and one safety guard.",
      "Record install time, failures, context overhead, permission prompts, and whether the extension improved the final score.",
      "Treat skills and MCP as portable building blocks. Treat plugin packaging and hooks as assistant-specific.",
      "Do not install a large plugin bundle until you have reviewed its code, permissions, and external connections.",
    ],
  },
  {
    id: "stage-6",
    week: "Week 6",
    title: "Run the distributed project",
    goal: "Prove that a frontier planner can direct smaller workers.",
    items: [
      "Use GPT-5.6 Sol as the first lead. Repeat once with Claude Opus 5 as lead.",
      "Give each worker a separate worktree, owned files, acceptance tests, and a machine-readable task file.",
      "Use DeepSeek for a bounded implementation, Kimi or Qwen Cloud for a larger worker task, and Terra or Sonnet for the difficult middle layer.",
      "Use the other vendor's frontier model as final reviewer, then run all tests and make the merge decision yourself.",
    ],
  },
  {
    id: "stage-7",
    week: "Final 2 days",
    title: "Analyze and publish",
    goal: "Make the conclusion honest and reusable.",
    items: [
      "Report medians and ranges; show every failure and intervention, not only the best run.",
      "Separate assistant effects, model effects, and native-pair results in the report.",
      "Write recommendations by task type: best planner, best daily driver, best local worker, best value, best extension system.",
      "Publish prompts, task versions, runner code, scoring rules, and raw results where licenses and privacy allow.",
    ],
  },
];

const sources = [
  ["OpenAI model guidance", "https://developers.openai.com/api/docs/guides/latest-model"],
  ["OpenAI model catalog", "https://developers.openai.com/api/docs/models"],
  ["Claude Code parallel agents", "https://code.claude.com/docs/en/agents"],
  ["Claude Code extension map", "https://code.claude.com/docs/en/features-overview"],
  ["Claude Code plugins", "https://code.claude.com/docs/en/plugins"],
  ["OpenCode providers", "https://opencode.ai/docs/providers"],
  ["OpenCode agents", "https://opencode.ai/docs/agents/"],
  ["OpenCode skills", "https://opencode.ai/docs/skills"],
  ["Pi agent harness", "https://github.com/earendil-works/pi"],
  ["Ollama launch integrations", "https://ollama.com/blog/launch"],
  ["Qwen3 Coder on Ollama", "https://ollama.com/library/qwen3-coder"],
  ["Kimi K2.7 Code on Ollama", "https://ollama.com/library/kimi-k2.7-code"],
  ["DeepSeek V4 Flash on Ollama", "https://ollama.com/library/deepseek-v4-flash"],
  ["Claude Opus 5", "https://www.anthropic.com/news/claude-opus-5"],
  ["Claude Sonnet 5", "https://www.anthropic.com/news/claude-sonnet-5"],
];

const navItems = [
  ["results", "Current findings"],
  ["scope", "Scope"],
  ["models", "Models"],
  ["design", "Study design"],
  ["tasks", "Tasks"],
  ["score", "Scoring"],
  ["ecosystem", "Extensions"],
  ["workflow", "Distributed work"],
  ["steps", "Step-by-step"],
  ["start", "Start here"],
];

function CheckIcon({ checked }: { checked: boolean }) {
  return <span aria-hidden="true">{checked ? "✓" : ""}</span>;
}

export default function Home() {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    let timer: number | undefined;
    try {
      const saved = window.localStorage.getItem("assistant-study-progress");
      const parsed = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed)) {
        timer = window.setTimeout(
          () => setCompleted(parsed.filter((item) => typeof item === "string")),
          0,
        );
      }
    } catch {
      // Progress is a convenience. The plan still works without browser storage.
    }
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  const completeCount = completed.length;
  const percent = Math.round((completeCount / stages.length) * 100);
  const progressText = useMemo(
    () => `${completeCount} of ${stages.length} stages complete`,
    [completeCount],
  );

  function toggleStage(id: string) {
    const next = completed.includes(id)
      ? completed.filter((item) => item !== id)
      : [...completed, id];
    setCompleted(next);
    try {
      window.localStorage.setItem(
        "assistant-study-progress",
        JSON.stringify(next),
      );
    } catch {
      // Ignore storage failures.
    }
  }

  function resetProgress() {
    setCompleted([]);
    try {
      window.localStorage.removeItem("assistant-study-progress");
    } catch {
      // Ignore storage failures.
    }
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to the plan
      </a>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Coding assistant study home">
          <span className="brand-mark">LAB / 01</span>
          <span>Coding assistant study</span>
        </a>
        <div className="header-actions">
          <div className="mini-progress" aria-label={progressText}>
            <span>{progressText}</span>
            <span className="mini-track" aria-hidden="true">
              <span style={{ width: `${percent}%` }} />
            </span>
          </div>
          <button className="text-button print-button" onClick={() => window.print()}>
            Print / save PDF
          </button>
        </div>
      </header>

      <div className="page-shell" id="top">
        <aside className="side-nav" aria-label="Plan sections">
          <p className="eyebrow">On this page</p>
          <nav>
            {navItems.map(([id, label], index) => (
              <a href={`#${id}`} key={id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {label}
              </a>
            ))}
          </nav>
          <div className="side-note">
            <p>Evidence status</p>
            <strong>Through T7</strong>
            <span>including the trade-capture build</span>
          </div>
        </aside>

        <main id="main-content">
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-copy">
              <p className="kicker">A live, reproducible benchmark</p>
              <h1 id="hero-title">
                Find the right <em>assistant</em>, the right <em>model</em>, and the
                right way to combine them.
              </h1>
              <p className="hero-lede">
                A repeatable study of Codex, Claude Code, and OpenCode—with
                frontier models in the lead and hosted open models as practical
                workers. The plan and the evidence now live together.
              </p>
              <div className="hero-actions">
                <a className="primary-button" href="#results">
                  See the findings
                </a>
                <a className="secondary-button" href="#design">
                  See the study design
                </a>
              </div>
            </div>
            <div className="hero-brief" aria-label="Key recommendation">
              <p className="eyebrow">Current recommendation</p>
              <p className="brief-big">Use a small team with clear roles.</p>
              <p>
                Codex leads and integrates. Claude challenges plans and reviews.
                OpenCode routes bounded work to the best hosted open model.
              </p>
              <dl>
                <div>
                  <dt>Default lead</dt>
                  <dd>Codex + GPT-5.6 Sol</dd>
                </div>
                <div>
                  <dt>Reviewer</dt>
                  <dd>Claude Code + Opus 5</dd>
                </div>
                <div>
                  <dt>Open worker</dt>
                  <dd>OpenCode + task-tested model</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="section-block results-section" id="results" aria-labelledby="results-title">
            <div className="section-heading split-heading">
              <div>
                <p className="section-number">Results / Current</p>
                <h2 id="results-title">What the recorded runs actually showed.</h2>
              </div>
              <p>
                These are one-run pilot findings, not universal rankings. Every
                failure, timeout, permission denial, and grader correction remains
                part of the evidence.
              </p>
            </div>

            <div className="verdict-grid">
              <article className="verdict-card verdict-primary">
                <span>Recommended lead</span>
                <h3>Codex</h3>
                <p>
                  Best default for controlled implementation and integration. It
                  won the T6 frontier comparison on speed and tool discipline.
                </p>
              </article>
              <article className="verdict-card">
                <span>Independent reviewer</span>
                <h3>Claude Code</h3>
                <p>
                  Strong planning challenge and careful final evidence. Explicit
                  tool authorization matters in narrow automated sessions.
                </p>
              </article>
              <article className="verdict-card verdict-open">
                <span>Open-model route</span>
                <h3>OpenCode</h3>
                <p>
                  A strong secondary tool, not a novelty. T7 showed both sides:
                  Qwen passed its bounded task and Kimi timed out on the broad one.
                </p>
              </article>
            </div>

            <div className="result-metrics" aria-label="Headline benchmark findings">
              <div>
                <strong>4 roles</strong>
                <span>Sol plan, mixed workers, Codex integration, Opus review</span>
              </div>
              <div>
                <strong>3.57×</strong>
                <span>Distributed T5 latency versus solo Codex</span>
              </div>
              <div>
                <strong>6 files</strong>
                <span>Codex fallback after the T7 Kimi worker wrote nothing</span>
              </div>
              <div>
                <strong>$1.7485</strong>
                <span>Metered OpenRouter spend; subscriptions separate</span>
              </div>
            </div>

            <div className="table-wrap results-table-wrap" tabIndex={0} aria-label="Selected benchmark results">
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Assistant + model</th>
                    <th>Score</th>
                    <th>Time</th>
                    <th>What mattered</th>
                  </tr>
                </thead>
                <tbody>
                  {resultRows.map((row) => (
                    <tr key={`${row.task}-${row.route}`}>
                      <td>{row.task}</td>
                      <td><strong>{row.route}</strong></td>
                      <td><span className="result-score">{row.score}</span></td>
                      <td>{row.time}</td>
                      <td>{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="evidence-summary-grid">
              <article>
                <span>T7 distributed product</span>
                <h3>The workflow worked, but the fallback mattered.</h3>
                <p>
                  Qwen completed the bounded insights panel for $0.1072. Kimi
                  timed out without writing the broader workspace, so Codex built
                  the six-file fallback and Opus found two real workflow defects.
                </p>
                <a href="/trade-capture">Open the synthetic trade-capture mock</a>
              </article>
              <article>
                <span>Portable extensions</span>
                <h3>One skill and MCP server worked across all three.</h3>
                <p>
                  Codex and OpenCode passed immediately. Claude first exposed a
                  permission setup trap, then passed a frozen recovery after only
                  the two read-only tools were preauthorized.
                </p>
              </article>
              <article>
                <span>Small-model lesson</span>
                <h3>Model and harness both matter.</h3>
                <p>
                  Kimi K3 earned a full T4 result but timed out on broad T7 work.
                  Qwen3.8-27B timed out on T4 yet passed a narrow T7 component.
                  Match the assignment to the model; do not rank from one run.
                </p>
              </article>
            </div>

            <div className="callout plain result-caveat">
              <strong>Decision now:</strong> Codex is the primary lead, Claude Code
              is the primary independent reviewer and alternate lead, and OpenCode
              is a strong secondary tool for hosted open-model work. More repeats
              are needed before claiming a general winner.
            </div>
          </section>

          <section className="section-block" id="scope">
            <div className="section-heading">
              <p className="section-number">01 / Scope</p>
              <h2>Four programs, with three in the final ranking.</h2>
              <p>
                Here, “assistant” or “harness” means the program around the model:
                its tools, planning, permissions, memory, plugins, and user
                experience. Pi is a control instrument, not a fourth primary winner.
              </p>
            </div>
            <div className="assistant-grid">
              {assistantCards.map((assistant) => (
                <article className="assistant-card" key={assistant.name}>
                  <div className="assistant-top">
                    <span className="assistant-mark">{assistant.mark}</span>
                    <span className="role-pill">{assistant.role}</span>
                  </div>
                  <h3>{assistant.name}</h3>
                  <p>{assistant.summary}</p>
                  <div className="test-note">
                    <span>Inspect</span>
                    <p>{assistant.test}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="callout plain">
              <strong>Boundary:</strong> compare Codex, Claude Code, and OpenCode
              as the products you may keep using. Use Pi to make the model test
              fair and to explore custom orchestration.
            </div>
          </section>

          <section className="section-block" id="models">
            <div className="section-heading split-heading">
              <div>
                <p className="section-number">02 / Models</p>
                <h2>A small, current model shortlist.</h2>
              </div>
              <p>
                Exact catalogs change quickly. Record the full model ID visible on
                the day of each run. “Open weight” is used for downloadable models
                because their licenses and definitions of open source differ.
              </p>
            </div>
            <div className="table-wrap model-table-wrap" tabIndex={0}>
              <table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Class</th>
                    <th>Access</th>
                    <th>Use in this study</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {modelRows.map((row) => (
                    <tr key={row.model}>
                      <td>
                        <strong>{row.model}</strong>
                        <span>{row.maker}</span>
                      </td>
                      <td>{row.lane}</td>
                      <td>{row.access}</td>
                      <td>{row.use}</td>
                      <td>
                        <span
                          className={`priority priority-${row.priority.toLowerCase()}`}
                        >
                          {row.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="model-rule-grid">
              <div>
                <span>Hardware rule</span>
                <p>
                  With 16 GB of unified memory, keep large open-weight models in
                  Ollama Cloud. Use Qwen3 8B only as a labeled small local control,
                  not as a substitute inside the shared-model lane.
                </p>
              </div>
              <div>
                <span>Budget rule</span>
                <p>
                  Use subscription access first. Use Ollama Cloud for Kimi and
                  DeepSeek. Treat Fable, Luna, Haiku, and paid APIs as optional until
                  the pilot proves they add a useful comparison.
                </p>
              </div>
            </div>
          </section>

          <section className="section-block" id="design">
            <div className="section-heading">
              <p className="section-number">03 / Study design</p>
              <h2>Three lanes prevent the wrong conclusion.</h2>
              <p>
                A great result may come from the model, the surrounding program, or
                both. These lanes separate those effects before you judge the full
                product.
              </p>
            </div>
            <div className="lane-list">
              {benchmarkLanes.map((lane) => (
                <article className="lane-card" key={lane.number}>
                  <span className="lane-number">{lane.number}</span>
                  <div className="lane-content">
                    <div className="lane-title-row">
                      <h3>{lane.title}</h3>
                      <span>{lane.lock}</span>
                    </div>
                    <p>{lane.body}</p>
                    <div className="lane-meta">
                      <p>
                        <strong>Target:</strong> {lane.runs}
                      </p>
                      <p>
                        <strong>Answers:</strong> {lane.answers}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="method-strip">
              <div>
                <span>Same start</span>
                <p>Clean commit and new session</p>
              </div>
              <div>
                <span>Same prompt</span>
                <p>Versioned and hashed</p>
              </div>
              <div>
                <span>Two runs</span>
                <p>Report median and range</p>
              </div>
              <div>
                <span>Blind grade</span>
                <p>Hide identity when possible</p>
              </div>
              <div>
                <span>Stop rule</span>
                <p>Maximum time and interventions</p>
              </div>
            </div>
          </section>

          <section className="section-block" id="tasks">
            <div className="section-heading split-heading">
              <div>
                <p className="section-number">04 / Task pack</p>
                <h2>Eight tasks that resemble real work.</h2>
              </div>
              <p>
                Use T1–T4 for the controlled comparison. Use T5–T8 for native
                product tests, plugin tests, and the distributed project.
              </p>
            </div>
            <div className="task-grid">
              {taskRows.map((task) => (
                <article className="task-card" key={task.id}>
                  <div className="task-labels">
                    <span>{task.id}</span>
                    <span>{task.kind}</span>
                  </div>
                  <h3>{task.title}</h3>
                  <p>{task.setup}</p>
                  <div className="pass-line">
                    <span>Pass when</span>
                    <p>{task.pass}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="callout warning">
              <strong>Do not use public benchmark tasks as your main evidence.</strong>
              Models may have seen them. Use private, frozen fixtures modeled on
              work you actually do. Public suites can be a small secondary check.
            </div>
          </section>

          <section className="section-block" id="score">
            <div className="section-heading">
              <p className="section-number">05 / Scoring</p>
              <h2>One 100-point score, backed by raw evidence.</h2>
              <p>
                The score makes comparison easier. The patch, tests, event log, and
                human notes remain the source of truth.
              </p>
            </div>
            <div className="score-layout">
              <div className="score-ring" aria-label="100 point score">
                <span>100</span>
                <p>total points</p>
              </div>
              <div className="score-list">
                {scoreRows.map(([label, points, proof]) => (
                  <div className="score-row" key={label}>
                    <span className="score-points">{points}</span>
                    <strong>{label}</strong>
                    <p>{proof}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="evidence-grid">
              <div>
                <h3>Always record</h3>
                <ul>
                  <li>Assistant version and exact model ID</li>
                  <li>Prompt version and repository commit</li>
                  <li>Context size, reasoning setting, permissions, and plugins</li>
                  <li>Elapsed time and time to an accepted result</li>
                  <li>Human interventions and permission prompts</li>
                </ul>
              </div>
              <div>
                <h3>Always save</h3>
                <ul>
                  <li>Event log or full transcript</li>
                  <li>Standard output and error output</li>
                  <li>Git patch and changed-file list</li>
                  <li>Visible and hidden test results</li>
                  <li>Final response and grader notes</li>
                </ul>
              </div>
              <div>
                <h3>Count an intervention when</h3>
                <ul>
                  <li>You correct a wrong plan or false claim</li>
                  <li>You provide a file location it should have found</li>
                  <li>You ask it to run a required check again</li>
                  <li>You approve a normal expected action only if comparing UX</li>
                  <li>You restart after a crash or unrecoverable loop</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="section-block" id="ecosystem">
            <div className="section-heading">
              <p className="section-number">06 / Skills, plugins, MCP, and hooks</p>
              <h2>Share the simple pieces. Keep product-specific wiring thin.</h2>
              <p>
                Skills and MCP are the most portable layer. Plugin packaging,
                lifecycle hooks, and permissions differ, so compare them as product
                features rather than forcing one configuration everywhere.
              </p>
            </div>
            <div className="portable-stack" aria-label="Portable extension stack">
              <div>
                <span>Shared rules</span>
                <strong>AGENTS.md</strong>
              </div>
              <span className="stack-arrow" aria-hidden="true">→</span>
              <div>
                <span>Shared workflow</span>
                <strong>SKILL.md</strong>
              </div>
              <span className="stack-arrow" aria-hidden="true">→</span>
              <div>
                <span>Shared tools</span>
                <strong>MCP servers</strong>
              </div>
              <span className="stack-arrow" aria-hidden="true">→</span>
              <div>
                <span>Local enforcement</span>
                <strong>Hooks + permissions</strong>
              </div>
            </div>
            <div className="table-wrap" tabIndex={0}>
              <table className="extension-table">
                <thead>
                  <tr>
                    <th>Layer</th>
                    <th>How to use it across assistants</th>
                    <th>What to measure</th>
                  </tr>
                </thead>
                <tbody>
                  {extensionRows.map((row) => (
                    <tr key={row.surface}>
                      <td><strong>{row.surface}</strong></td>
                      <td>{row.common}</td>
                      <td>{row.measure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ecosystem-notes">
              <article>
                <span>Codex</span>
                <p>
                  Test project instructions, skills, installable plugins, MCP,
                  hooks, custom agents, subagents, and structured exec output.
                </p>
              </article>
              <article>
                <span>Claude Code</span>
                <p>
                  Test CLAUDE.md importing AGENTS.md, skills, marketplace plugins,
                  MCP, deterministic hooks, subagents, agent teams, and worktrees.
                </p>
              </article>
              <article>
                <span>OpenCode</span>
                <p>
                  Test AGENTS.md, shared skills, provider plugins, custom tools, MCP,
                  fine-grained permissions, and its evolving V2 plugin API.
                </p>
              </article>
              <article>
                <span>Pi</span>
                <p>
                  Test AGENTS.md, Agent Skills, TypeScript extensions, packages,
                  JSON/RPC/SDK use, and external sandboxing because Pi has no built-in
                  permission boundary.
                </p>
              </article>
            </div>
            <div className="callout plain">
              <strong>Cross-tool rule file:</strong> keep the real project guidance in
              <code> AGENTS.md</code>. Put <code>@AGENTS.md</code> at the top of
              Claude Code&apos;s <code>CLAUDE.md</code>. Do not maintain two copies.
            </div>
          </section>

          <section className="section-block" id="workflow">
            <div className="section-heading">
              <p className="section-number">07 / Distributed project</p>
              <h2>Let one frontier model direct smaller workers.</h2>
              <p>
                The assistants should not edit one checkout together. Coordinate
                them through task files and Git worktrees, then merge only verified
                patches.
              </p>
            </div>
            <div className="workflow-diagram" aria-label="Distributed coding workflow">
              <div className="workflow-node lead-node">
                <span>1 / Lead</span>
                <strong>GPT-5.6 Sol</strong>
                <p>Clarify scope, acceptance checks, boundaries, and task split.</p>
              </div>
              <div className="workflow-down" aria-hidden="true">↓</div>
              <div className="workflow-node contract-node">
                <span>2 / Contract</span>
                <strong>Versioned task JSON</strong>
                <p>Goal, owned files, read-only context, checks, limits, output path.</p>
              </div>
              <div className="workflow-down" aria-hidden="true">↓</div>
              <div className="worker-grid">
                <div className="workflow-node worker-node">
                  <span>3A / Bounded worker</span>
                  <strong>OpenCode + DeepSeek</strong>
                  <p>Tests, fixtures, boilerplate, or a clearly isolated module.</p>
                </div>
                <div className="workflow-node worker-node">
                  <span>3B / Larger worker</span>
                  <strong>Pi + Kimi/Qwen Cloud</strong>
                  <p>Longer isolated implementation with machine-readable output.</p>
                </div>
                <div className="workflow-node worker-node">
                  <span>3C / Strong worker</span>
                  <strong>Codex Terra / Sonnet 5</strong>
                  <p>Difficult integration point, migration, or cross-file logic.</p>
                </div>
              </div>
              <div className="workflow-down" aria-hidden="true">↓</div>
              <div className="workflow-node review-node">
                <span>4 / Independent review</span>
                <strong>Claude Opus 5</strong>
                <p>Review patches from the other vendor, run full checks, and list merge risks.</p>
              </div>
              <div className="workflow-down" aria-hidden="true">↓</div>
              <div className="workflow-node human-node">
                <span>5 / Decision</span>
                <strong>Tests + human approval</strong>
                <p>Merge one patch at a time. Re-run the full suite after every merge.</p>
              </div>
            </div>
            <div className="contract-grid">
              <article>
                <span>Task file must say</span>
                <ul>
                  <li>One clear outcome</li>
                  <li>Files the worker owns</li>
                  <li>Files it may read but not edit</li>
                  <li>Acceptance and verification commands</li>
                  <li>Time, tool, and permission limits</li>
                </ul>
              </article>
              <article>
                <span>Worker must return</span>
                <ul>
                  <li>Status: complete, failed, or blocked</li>
                  <li>Patch and changed-file list</li>
                  <li>Commands run and results</li>
                  <li>Assumptions and remaining risks</li>
                  <li>No merge, push, deploy, or hidden side effect</li>
                </ul>
              </article>
              <article>
                <span>Rotate bias</span>
                <ul>
                  <li>Run once with Sol leading and Opus reviewing</li>
                  <li>Run once with Opus leading and Sol reviewing</li>
                  <li>Keep worker tasks and acceptance checks unchanged</li>
                  <li>Compare coordination time and integration failures</li>
                </ul>
              </article>
            </div>
          </section>

          <section className="section-block" id="steps">
            <div className="section-heading steps-heading">
              <div>
                <p className="section-number">08 / Step-by-step</p>
                <h2>Follow this sequence.</h2>
                <p>Check a stage when its evidence is saved, not when it has merely started.</p>
              </div>
              <div className="large-progress" aria-label={progressText}>
                <div>
                  <strong>{percent}%</strong>
                  <button onClick={resetProgress}>Reset</button>
                </div>
                <span aria-hidden="true"><span style={{ width: `${percent}%` }} /></span>
                <p>{progressText}</p>
              </div>
            </div>
            <div className="timeline">
              {stages.map((stage, index) => {
                const isDone = completed.includes(stage.id);
                return (
                  <article className={`stage-card ${isDone ? "is-done" : ""}`} key={stage.id}>
                    <button
                      className="stage-check"
                      aria-label={`${isDone ? "Mark incomplete" : "Mark complete"}: ${stage.title}`}
                      aria-pressed={isDone}
                      onClick={() => toggleStage(stage.id)}
                    >
                      <CheckIcon checked={isDone} />
                    </button>
                    <div className="stage-index">{String(index + 1).padStart(2, "0")}</div>
                    <div className="stage-copy">
                      <span>{stage.week}</span>
                      <h3>{stage.title}</h3>
                      <p>{stage.goal}</p>
                    </div>
                    <ul>
                      {stage.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="section-block start-section" id="start">
            <div className="section-heading">
              <p className="section-number">09 / Start here</p>
              <h2>Your first working session.</h2>
              <p>
                Do only these actions first. Do not download every model or build a
                large dashboard before the first end-to-end run works.
              </p>
            </div>
            <div className="start-grid">
              <article className="command-card">
                <div className="command-title">
                  <span>1</span>
                  <h3>Record the environment</h3>
                </div>
                <pre><code>{`codex --version
claude --version
opencode --version
pi --version
ollama --version
ollama list
git rev-parse HEAD
system_profiler SPHardwareDataType`}</code></pre>
              </article>
              <article className="command-card">
                <div className="command-title">
                  <span>2</span>
                  <h3>Confirm the common model</h3>
                </div>
                <pre><code>{`ollama pull deepseek-v4-flash:cloud
ollama run deepseek-v4-flash:cloud
ollama pull kimi-k2.7-code:cloud

# Optional laptop-sized local control:
ollama pull qwen3:8b`}</code></pre>
              </article>
              <article className="command-card wide-card">
                <div className="command-title">
                  <span>3</span>
                  <h3>Create the evidence folders</h3>
                </div>
                <pre><code>{`benchmark/
├── STUDY.md
├── tasks/T1-repo-map/
│   ├── prompt.md
│   ├── rubric.json
│   └── fixture.lock
├── schemas/{run,task,result}.schema.json
├── runner/
└── runs/<run-id>/
    ├── metadata.json
    ├── prompt.md
    ├── events.jsonl
    ├── stdout.log
    ├── stderr.log
    ├── changes.patch
    ├── tests.json
    ├── result.json
    └── grader.json`}</code></pre>
              </article>
            </div>
            <div className="first-run">
              <div>
                <p className="eyebrow">The first proof</p>
                <h3>Run T1 once in OpenCode with DeepSeek V4 Flash Cloud.</h3>
                <p>
                  Start from a clean repository. Ask for the repository map in
                  read-only mode. Save every artifact, run the grader, then reset.
                  Only after that succeeds should you add Codex, Claude Code, and Pi.
                </p>
              </div>
              <ol>
                <li>One task</li>
                <li>One model</li>
                <li>One assistant</li>
                <li>One complete evidence folder</li>
              </ol>
            </div>
          </section>

          <section className="section-block guardrails-section">
            <div className="section-heading">
              <p className="section-number">Guardrails</p>
              <h2>Rules that keep the project credible.</h2>
            </div>
            <div className="guardrail-grid">
              <p><span>01</span> Freeze prompt and task versions before comparison.</p>
              <p><span>02</span> Never let two workers write the same worktree.</p>
              <p><span>03</span> Do not grade only the final answer; grade the patch and tests.</p>
              <p><span>04</span> Record failures, refusals, crashes, and abandoned runs.</p>
              <p><span>05</span> Keep credentials outside prompts, logs, patches, and repositories.</p>
              <p><span>06</span> Require human approval for merges, pushes, deploys, and destructive actions.</p>
              <p><span>07</span> Review third-party plugins and MCP servers before installation.</p>
              <p><span>08</span> Re-run a study block when a model or assistant version changes materially.</p>
            </div>
          </section>

          <section className="section-block sources-section">
            <div className="section-heading split-heading">
              <div>
                <p className="section-number">Current references</p>
                <h2>Primary sources used for this plan.</h2>
              </div>
              <p>
                Model and product details were checked on August 22, 2026. Recheck
                the catalogs immediately before the first recorded run.
              </p>
            </div>
            <div className="source-grid">
              {sources.map(([label, href], index) => (
                <a href={href} target="_blank" rel="noreferrer" key={href}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {label}
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </section>

          <footer>
            <p>Coding assistant study plan</p>
            <p>Prepared August 22, 2026 · Keep the evidence, not just the winner.</p>
          </footer>
        </main>
      </div>
    </>
  );
}
