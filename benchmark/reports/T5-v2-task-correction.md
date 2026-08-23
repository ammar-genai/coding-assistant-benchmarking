# T5 private-grader correction

Date: 2026-08-23

Original task: `T5-review-queue@1.0.0`

Corrected grading contract: `T5-review-queue-v2@1.0.1`

## Problem

The original private documentation check required the exact hyphenated phrase
`in-memory`. The solo control wrote `in memory`, then explicitly stated that
the store is not durable and that all reviews reset when the process restarts.
That satisfies the frozen task's behavioral documentation requirement.

The raw runner result remains a failure under the original suite. Treating that
wording difference as a product defect would be misleading, so the official
comparison applies a separately versioned behavior-focused suite without
rerunning or editing either candidate patch.

## Correction

The v2 private suite accepts `in-memory` or `in memory`. It also checks label,
caption, and live-status landmarks without requiring a particular harmless
attribute order or forbidding extra static attributes.

All store, API, isolation, validation, filtering, error, escaping, test-quality,
scope, and reset-on-restart requirements remain unchanged. The task prompt and
visible command are identical. The original suite and raw evidence are
preserved.
