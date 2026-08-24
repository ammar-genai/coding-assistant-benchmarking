import type { Metadata } from "next";
import "./tasks.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const sitePath = (path: string) => `${basePath}${path}`;

type PublicTask = {
  id: string;
  phase: string;
  kind: string;
  title: string;
  assignment: string;
  reference: string;
  requirements: string[];
  measured: string[];
  paths: string[];
};

const publicTasks: PublicTask[] = [
  {
    id: "T1",
    phase: "Phase 1",
    kind: "Read-only analysis",
    title: "Map an unfamiliar repository",
    assignment: "Inspect the study repository as a new contributor, explain its architecture and main request flow, identify verification paths and risks, and propose a small plan for adding a visible pilot-completed status. No implementation was allowed.",
    reference: "The repository itself was the fixture. Candidates could inspect application code, scripts, tests, and benchmark contracts, but could not edit files, use the network, install dependencies, start services, or change Git state.",
    requirements: [
      "Return Architecture, Main request flow, Verification, Risks and unknowns, and Small change plan sections.",
      "Cite concrete repository paths and keep the report below 900 words.",
      "Leave the workspace completely unchanged.",
    ],
    measured: ["Repository comprehension", "Evidence citation", "Read-only discipline", "Safe change planning"],
    paths: ["benchmark/tasks/T1-repo-map/prompt.md", "benchmark/tasks/T1-repo-map/rubric.json"],
  },
  {
    id: "T2",
    phase: "Phase 1",
    kind: "Small repair",
    title: "Filter invalid comparison runs",
    assignment: "Repair one JavaScript selection function so a run is eligible only when it completed, passed acceptance, and was not explicitly excluded from comparison.",
    reference: "A small seeded module contained the faulty eligibility logic. A committed visible test and a private behavior suite checked the exact filter contract.",
    requirements: [
      "Require status complete, acceptance status pass, and comparison_eligible not false.",
      "Preserve input order and object identity without mutating the input.",
      "Change only the single allowed implementation file.",
    ],
    measured: ["Minimal bug fixing", "Conjunction logic", "Immutability", "Exact scope control"],
    paths: ["benchmark/tasks/T2-filter-valid-runs/prompt.md", "benchmark/fixtures/T2-run-filter/select-comparison-runs.mjs", "benchmark/tasks/T2-filter-valid-runs/rubric.json"],
  },
  {
    id: "T3",
    phase: "Phase 1",
    kind: "Multi-file feature",
    title: "Build an assistant comparison summary",
    assignment: "Implement run aggregation and Markdown reporting, then add assistant-authored tests. The result grouped eligible runs, selected a deterministic best run, calculated medians, and rendered a safe comparison table.",
    reference: "The fixture supplied incomplete summary and renderer modules plus synthetic run records and committed tests. Candidates completed two implementation files and a student-test file.",
    requirements: [
      "Validate records, group exact assistant names, and preserve inputs.",
      "Use score, elapsed time, and run ID as deterministic best-run tie breakers.",
      "Render the exact table shape, escape pipe characters, and cover the empty state.",
    ],
    measured: ["Multi-file implementation", "Data validation", "Deterministic aggregation", "Test quality"],
    paths: ["benchmark/tasks/T3-comparison-summary/prompt.md", "benchmark/fixtures/T3-comparison-summary/", "benchmark/tasks/T3-comparison-summary/rubric.json"],
  },
  {
    id: "T4",
    phase: "Phase 1",
    kind: "Complex interface",
    title: "Build a responsive run explorer",
    assignment: "Create a benchmark-run interface with assistant and outcome filters, deterministic sorting, summary metrics, accessible status updates, safe DOM rendering, and responsive presentation.",
    reference: "A controlled HTML, CSS, and JavaScript fixture provided the starting surface. The counted v2 contract removed one accidental private assertion about a CSS class name while preserving the behavioral task.",
    requirements: [
      "Filter and sort without mutating records; place unknown cost last.",
      "Show pass rate, median time, total known cost, records, reset behavior, and an empty state.",
      "Use safe DOM APIs, visible focus, reduced motion, and a layout usable at 720 pixels or below.",
    ],
    measured: ["Frontend architecture", "Accessibility", "Responsive design", "Browser verification"],
    paths: ["benchmark/tasks/T4-run-explorer-v2/prompt.md", "benchmark/fixtures/T4-run-explorer/", "benchmark/reports/T4-v2-task-correction.md"],
  },
  {
    id: "T5",
    phase: "Phase 1",
    kind: "Distributed cross-layer feature",
    title: "Build a benchmark review queue",
    assignment: "Implement an in-memory review store, JSON API, safe rendered page, tests, and operating documentation. Run the same feature through a distributed plan-review-build-integrate-review workflow and a solo Codex control.",
    reference: "A five-file fixture defined storage, API, HTML, test, and documentation boundaries. The corrected grader accepted equivalent in-memory wording without changing either candidate patch.",
    requirements: [
      "Maintain one current review per run, copied records, deterministic ordering, and decision filters.",
      "Implement collection and detail API behavior with strict validation and correct status codes.",
      "Escape every dynamic HTML value, provide accessible landmarks, add tests, and document non-durability.",
    ],
    measured: ["Cross-layer engineering", "Distributed orchestration", "Independent review", "Solo-versus-team efficiency"],
    paths: ["benchmark/tasks/T5-review-queue/prompt.md", "benchmark/fixtures/T5-review-queue/", "benchmark/reports/T5-distributed-workflow-comparison.md"],
  },
  {
    id: "T6",
    phase: "Phase 1",
    kind: "Debugging incident",
    title: "Repair a rejected-Promise cache",
    assignment: "Diagnose why requests continued returning an old timeout after the origin recovered, repair the cache and API behavior, add concurrency regression tests, and complete a plain-language incident report.",
    reference: "The fixture included cache and API code, committed tests, an incident log, and an incident template. A healthy-origin signal was intentionally misleading because the rejected Promise could remain cached.",
    requirements: [
      "Coalesce concurrent misses and isolate tenants while preserving successful cached results.",
      "Remove failed or invalid loads without allowing a late failure to delete a newer replacement.",
      "Preserve API responses, add meaningful recovery tests, and document evidence and remaining risk.",
    ],
    measured: ["Root-cause analysis", "Promise lifecycle", "Concurrency races", "Incident communication"],
    paths: ["benchmark/tasks/T6-rejected-promise-cache/prompt.md", "benchmark/fixtures/T6-rejected-promise-cache/", "benchmark/reports/T6-top-frontier-comparison.md"],
  },
  {
    id: "T7",
    phase: "Phase 1",
    kind: "Distributed product build",
    title: "Securitized-product trade capture",
    assignment: "Plan, divide, implement, integrate, independently review, and repair a polished local trade-capture workspace for a synthetic securitized-products desk.",
    reference: "The product brief froze six product categories, economics, validation, lifecycle, accessibility, synthetic-data, and technical boundaries. A reviewed architecture contract assigned non-overlapping files to Terra, Sonnet, Qwen, and Kimi, with Sol integration and Opus review.",
    requirements: [
      "Support enter, validate, save, book, edit, review, filter, sort, select, and cancel workflows.",
      "Calculate current face, gross principal, signed exposure, desk totals, validation, and audit history deterministically.",
      "Keep the route responsive and accessible, use local synthetic state only, and pass the full repository gate.",
    ],
    measured: ["Frontier planning", "Bounded worker delegation", "Integration fallback", "Independent defect discovery"],
    paths: ["benchmark/projects/T7-securitized-trade-capture/PRODUCT.md", "benchmark/projects/T7-securitized-trade-capture/CONTRACT.md", "benchmark/projects/T7-securitized-trade-capture/IMPLEMENTATION-LOG.md"],
  },
  {
    id: "T8",
    phase: "Phase 2",
    kind: "Neutral Pi analysis",
    title: "Analyze corrected-event impact",
    assignment: "Write a read-only change-impact memo for adding trade.corrected events. Trace the current event flow, identify the smallest future changes, explain replay and failure risks, and propose focused verification.",
    reference: "A synthetic change request, event normalizer, router, in-memory store, and visible test described the current save-before-publish behavior and correction constraints.",
    requirements: [
      "Preserve the original and correction in audit history while allowing only one active contribution.",
      "Address idempotency, missing targets, trade mismatch, publish failure, replay, and input immutability.",
      "Stay read-only, separate fixture facts from recommendations, and remain below 1,000 words.",
    ],
    measured: ["Change-impact reasoning", "Failure modeling", "Contract design", "Read-only scope"],
    paths: ["benchmark/tasks/T8-change-impact-analysis/prompt.md", "benchmark/fixtures/T8-change-impact/change-request.md", "benchmark/fixtures/T8-change-impact/"],
  },
  {
    id: "T9",
    phase: "Phase 2",
    kind: "Neutral Pi implementation",
    title: "Implement deterministic capacity allocation",
    assignment: "Repair an allocation engine so requests compete independently within each desk and receive capacity by priority, submission time, and ID, while results remain in original input order.",
    reference: "The deliberately incorrect starter gave every request its full amount. Committed tests established the main behavior, and candidates had to add at least three meaningful tests.",
    requirements: [
      "Validate the complete request and capacity input before allocating.",
      "Never exceed request or desk capacity; return allocated and unfilled amounts for every request.",
      "Use deterministic tie breakers and never mutate requests or the capacity object.",
    ],
    measured: ["Input validation", "Deterministic algorithms", "Mutation safety", "Unattended completion"],
    paths: ["benchmark/tasks/T9-capacity-allocation/prompt.md", "benchmark/fixtures/T9-capacity-allocation/allocation-engine.mjs", "benchmark/tasks/T9-capacity-allocation/rubric.json"],
  },
  {
    id: "T10",
    phase: "Phase 2",
    kind: "Neutral Pi concurrency incident",
    title: "Repair a concurrent event projector",
    assignment: "Replace one poisoned global Promise queue with recoverable per-trade sequencing, safe persistence, exact event versioning, terminal cancellation, regression tests, and a completed incident report.",
    reference: "The starter projector serialized every trade behind one queue, committed state before persistence, and allowed a rejection to poison later work. Two visible tests covered same-trade order and basic recovery; private checks remained hidden.",
    requirements: [
      "Serialize one trade in call order while allowing unrelated trades to progress concurrently.",
      "Commit only after persistence succeeds and recover after rejection without losing isolation.",
      "Enforce event validation, exact versions, stale handling, cancellation, immutability, and at least four new tests.",
    ],
    measured: ["Concurrency repair", "Failure recovery", "Event contracts", "Repeat reliability"],
    paths: ["benchmark/tasks/T10-event-projector/prompt.md", "benchmark/fixtures/T10-event-projector/event-projector.mjs", "benchmark/phase-2/PROTOCOL.md"],
  },
];

export const metadata: Metadata = {
  title: "T1–T10 Public Task Briefs | Coding Intelligence Field Study",
  description: "Public, self-contained descriptions of the ten tasks used in the coding assistant and neutral model field study.",
};

export default function PublicTaskBriefsPage() {
  return (
    <>
      <a className="skip-link" href="#task-briefs">Skip to the task briefs</a>
      <header className="task-doc-header">
        <a className="task-doc-brand" href={sitePath("/")} aria-label="Return to the Coding Intelligence Field Study">
          <span>CI</span><strong>Public Task Briefs</strong>
        </a>
        <nav aria-label="Task brief phases">
          <a href="#phase-1">Phase 1</a>
          <a href="#phase-2">Phase 2</a>
          <a href={sitePath("/#task-reference")}>Study website</a>
        </nav>
      </header>

      <main className="task-doc-shell" id="task-briefs">
        <section className="task-doc-hero">
          <p>Public evidence layer / T1–T10</p>
          <h1>The work behind<br /><em>every score.</em></h1>
          <div className="task-doc-hero-grid">
            <p>These briefs explain the real assignment, the code or specification each candidate received, the acceptance contract, and the capability being measured.</p>
            <aside><strong>Repository boundary</strong><p>The source repository remains private. No hidden tests, raw transcripts, credentials, or private run evidence are reproduced here.</p></aside>
          </div>
        </section>

        <nav className="task-doc-index" aria-label="All public task briefs">
          {publicTasks.map((task) => <a href={`#${task.id.toLowerCase()}`} key={task.id}><span>{task.id}</span>{task.title}</a>)}
        </nav>

        <div className="task-doc-phase" id="phase-1"><span>Phase 1</span><strong>Assistant products and distributed development</strong><p>T1–T7</p></div>

        <div className="task-doc-list">
          {publicTasks.map((task, index) => (
            <section className={`task-doc-card ${task.id === "T7" ? "task-doc-card-featured" : ""}`} id={task.id.toLowerCase()} key={task.id}>
              {task.id === "T8" && <div className="task-doc-phase task-doc-phase-inline" id="phase-2"><span>Phase 2</span><strong>Five models inside one neutral Pi harness</strong><p>T8–T10</p></div>}
              <header>
                <div className="task-doc-number"><span>{String(index + 1).padStart(2, "0")}</span><strong>{task.id}</strong></div>
                <div><p>{task.phase} / {task.kind}</p><h2>{task.title}</h2></div>
              </header>

              <div className="task-doc-summary-grid">
                <article><span>Actual assignment</span><p>{task.assignment}</p></article>
                <article><span>Underlying reference</span><p>{task.reference}</p></article>
              </div>

              <div className="task-doc-contract">
                <div><span>Acceptance contract</span><ul>{task.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul></div>
                <div><span>What it measured</span><ul className="task-doc-tags">{task.measured.map((measure) => <li key={measure}>{measure}</li>)}</ul></div>
              </div>

              <div className="task-doc-paths">
                <span>Authoritative private source paths</span>
                <div>{task.paths.map((path) => <code key={path}>{path}</code>)}</div>
              </div>
            </section>
          ))}
        </div>

        <section className="task-doc-method-note">
          <div><span>Evidence rule</span><h2>Public explanation. Private verification.</h2></div>
          <p>The prompts and acceptance summaries above are safe to present. Detailed private checks remain outside the model context and outside this public site so the benchmark can be reused without leaking its grading implementation.</p>
          <a href={sitePath("/#task-reference")}>Return to the study results <span aria-hidden="true">→</span></a>
        </section>
      </main>

      <footer className="task-doc-footer"><strong>Coding Intelligence Field Study</strong><p>Synthetic tasks · public briefs · private verification evidence</p><a href={sitePath("/")}>Main study</a></footer>
    </>
  );
}
