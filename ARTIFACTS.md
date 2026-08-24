# Complete Artifact Archive

This manifest defines the full-session archive preserved in the private GitHub repository. It separates research evidence from generated machine state so the project remains useful, reproducible, and safe to store.

## 1. Research contracts and decisions

- `benchmark/PROGRAM.md` and `benchmark/STUDY.md` — study design and controls
- `benchmark/tasks/` — versioned prompts, contracts, rubrics, and acceptance rules
- `benchmark/blocks/` — preregistered comparison blocks and saved result summaries
- `benchmark/decisions/` — material study and workflow decisions
- `benchmark/environment/` and `benchmark/access/` — recorded execution environment and access checks

## 2. Complete saved evidence

- `benchmark/runs/` — 78 recorded run directories covering assistant, distributed, and Pi model work
- `benchmark/feature-runs/` — four cross-assistant audit-skill invocation runs
- `benchmark/private/` — 18 private acceptance tests and reference fixtures used to verify recorded work
- `benchmark/schemas/` — machine-readable task, run, and result formats
- `benchmark/fixtures/` and `benchmark/projects/` — controlled task baselines and generated benchmark projects

Saved evidence includes prompts, manifests, patches, standard output, standard error, verification records, graders, telemetry fields, and final result files when produced by the run.

## 3. Findings and research packaging

- `benchmark/reports/phase-1/` — comprehensive, executive, and brief Phase 1 reports
- `benchmark/reports/phase-2/` — audit, comprehensive, executive, and brief Phase 2 reports
- `benchmark/reports/final-study-report.md` — cross-phase synthesis
- `benchmark/reports/` — task-level comparisons, harness notes, recovery records, and browser-QA evidence
- `RESUME.md` — chronological project state and continuation history

## 4. Working applications

- `app/page.tsx` and `app/globals.css` — public research showcase and end-to-end study flow
- `app/lab/` — interactive Research Lab
- `app/trade-capture/` — synthetic securitized-products trade-capture workspace
- `tests/` — rendered application and trade-domain regression coverage

## 5. Harnesses and portable tooling

- `scripts/benchmark-*.mjs` — assistant runner, workflow runner, environment checks, and contract validation
- `scripts/phase2-validate.mjs` and `scripts/pi-telemetry*` — neutral Pi evidence validation and telemetry parsing
- `.agents/skills/benchmark-audit/` — Codex/OpenAI-compatible benchmark audit skill
- `.claude/skills/benchmark-audit/` — Claude Code-compatible benchmark audit skill
- `benchmark/extensions/benchmark-audit/` — read-only MCP audit extension and tests
- `opencode.json` — OpenCode project configuration

## 6. Presentation artifacts

- `output/pdf/coding-intelligence-field-study.pdf` — research paper
- `output/presentation/coding-intelligence-field-study.pptx` — audience presentation
- `public/research-paper.pdf` and `public/presentation-deck.pptx` — deployable copies
- `public/og.png` — social preview card
- `public/trade-capture-structure.png` — trade application visual asset
- `scripts/build_research_paper.py` — reproducible paper-generation source

## 7. Hosting surfaces

- Public site: <https://ammar-genai.github.io/coding-intelligence-field-study/>
- Public compiled-site repository: <https://github.com/ammar-genai/coding-intelligence-field-study>
- `next.config.ts`, `public/.nojekyll`, and the `build:pages` package script preserve the GitHub Pages static-export path.

## Archive exclusions

The archive intentionally excludes:

- `.env*` files and credentials
- provider tokens, GitHub tokens, Cloudflare tokens, and account authentication state
- `node_modules/` and package-manager caches
- `.next/`, `.vinext/`, `dist/`, `out/`, `.wrangler/`, and other reproducible build output
- temporary worktrees, deployment staging directories, and local terminal state
- `.DS_Store`, TypeScript incremental caches, inspection renders, and similar machine-local files

The excluded material is not research evidence and can either be regenerated or must remain local for security reasons.

## Verification baseline

The archival release is expected to pass:

```bash
npm run verify
npm run benchmark:phase2:validate
```

The GitHub Pages export is expected to produce static routes for `/`, `/lab/`, and `/trade-capture/`, together with the paper, deck, and public visual assets.

## Dependency snapshot

The archive intentionally preserves the exact dependency versions used for the recorded study. An npm production-dependency audit on August 24, 2026 reported four high-severity advisory groups in the historical tree: `next`, its nested `postcss` and `sharp` packages, and `nanoid`.

The published GitHub Pages showcase is a static export and does not run the Next.js server or Server Actions. Before using this repository for a network-accessible server deployment, update the affected dependencies, rerun the full verification suite, and review behavior changes rather than applying a forced upgrade to the historical archive without validation.
