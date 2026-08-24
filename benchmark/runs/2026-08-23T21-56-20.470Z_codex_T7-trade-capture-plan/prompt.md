# Read-only architecture task

Plan the implementation of the securitized-product trade capture mock described
in `benchmark/projects/T7-securitized-trade-capture/PRODUCT.md`.

Inspect the existing application structure, package scripts, TypeScript setup,
and test approach before proposing files. This is a read-only task. Do not edit,
create, rename, or delete files. Do not use the network, install dependencies,
change Git state, start a service, or inspect `benchmark/private` or
`benchmark/runs`.

The implementation must be divided across four bounded workers:

1. Codex + GPT-5.6 Terra for domain types, calculations, validation, seed data,
   and domain tests.
2. Claude Code + Sonnet 5 for the accessible trade-ticket component.
3. OpenCode + Qwen3.8-27B for a small desk-insights component.
4. OpenCode + Kimi K3 for application state, blotter, selected-trade review,
   and visual system.

Codex + GPT-5.6 Sol will integrate. Claude Code + Opus 5 will review the plan
and later review the completed application.

Return a concise report with these exact sections:

## Product interpretation

State the workflow and the most important simplifying assumptions.

## Architecture

Define the route, client/server boundary, state ownership, domain module, and
component tree.

## Stable contracts

Specify exact exported TypeScript types, functions, and component props that
must be frozen before worker execution.

## File ownership

Give each of the four implementation workers an explicit, non-overlapping list
of owned files. Identify the small set of integrator-owned files.

## Worker tasks

For each worker, give the acceptance requirements, commands it may run, and
what it must not change.

## Integration sequence

Explain how Sol should combine the four patches and how to handle an interface
mismatch without hiding a worker failure.

## Verification

Define domain tests, type checking, lint, build, rendered-HTML assertions, and
manual checks. Separate checks that can run in isolated worker branches from the
final integrated gate.

## Risks and review focus

List the five most important domain or engineering risks for the Opus reviewer.

Keep the report below 1,800 words. Cite concrete repository paths for claims
about the existing application.
