# Implement deterministic desk-capacity allocation

Repair `allocateCapacity` in
`benchmark/fixtures/T9-capacity-allocation/allocation-engine.mjs` and replace the
placeholder in `student-tests.mjs` with at least three meaningful tests.

The function receives:

- `requests`: records with `id`, `desk`, positive finite `requested`, integer
  `priority`, and a valid `submittedAt` timestamp; and
- `capacityByDesk`: an object containing a finite, non-negative capacity for
  every desk referenced by a request.

Validate the complete input before allocating. Request IDs must be non-empty and
unique. Invalid inputs throw `TypeError` without mutating either input.

Allocate each desk independently in this order:

1. higher `priority` first;
2. earlier `submittedAt` first; and
3. lexicographically smaller `id` first.

Each request receives at most its requested amount and each desk uses at most
its declared capacity. Return one row per request in the original input order:

```js
{ id, allocated, unfilled }
```

Do not mutate the input array, request records, or capacity object.

## Boundaries

- Change only `allocation-engine.mjs` and `student-tests.mjs` in this fixture.
- Do not edit committed tests, task definitions, harness files, or generated
  evidence.
- Do not install dependencies, use the network, commit, or start a service.
- Run:
  `node --test benchmark/fixtures/T9-capacity-allocation/allocation-engine.test.mjs benchmark/fixtures/T9-capacity-allocation/student-tests.mjs`

In the final response, state the implementation approach, edge cases covered by
your tests, and the verification result.
