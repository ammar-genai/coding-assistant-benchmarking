# Repository analysis task

Analyze this repository as if you are joining the project and need to make a safe change next.

This is a read-only task. Do not edit, create, rename, or delete files. Do not install dependencies, change Git state, start a service, or use the network.

Return a concise report with these exact sections:

## Architecture

Explain the purpose of the repository, the main technologies, and the responsibilities of its important directories and entry points.

## Main request flow

Trace one user request from the browser or other primary entry point through the important code and back to the response. Cite concrete file paths.

## Verification

List the available build, test, type-check, and lint commands. Explain what each one proves. Do not run commands that change the workspace.

## Risks and unknowns

Identify the three most important maintenance risks or unclear areas. Separate evidence from inference.

## Small change plan

Suppose the next task is to add a visible “pilot completed” status to the study page. Give a five-step implementation and verification plan without making the change.

Keep the entire response below 900 words. Do not claim that you opened or verified a file unless you actually inspected it.
