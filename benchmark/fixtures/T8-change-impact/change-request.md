# Change request: corrected trade events

Operations needs to accept `trade.corrected` events. A correction identifies an
earlier accepted event by `correctsEventId`, supplies a complete replacement
payload, and must not cause the original and replacement to be counted at the
same time.

The team wants a change-impact memo before implementation. The memo must explain
the current flow, identify the exact code and contract surfaces that would need
to change, describe failure and replay risks, and propose focused tests. No code
should be changed during this task.

Constraints for a future implementation:

- Event IDs are globally unique.
- Corrections can arrive after the original event has already been routed.
- The corrected event keeps its own event ID and audit timestamp.
- A correction for a missing event is rejected rather than held indefinitely.
- Replaying the same correction must be idempotent.
- The in-memory store is only a fixture; do not propose a database migration.
