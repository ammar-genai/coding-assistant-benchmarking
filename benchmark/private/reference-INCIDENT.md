# Event projector incident

## Impact

Temporary persistence failures committed memory early and blocked later work.

## Root cause

A global promise chain combined unrelated trades and remained rejected.

## Fix

Per-trade recoverable queues commit state only after persistence succeeds.

## Regression coverage

Tests cover concurrency, rejection recovery, versions, cancellation, and copies.

## Remaining risk

The fixture remains an in-memory single-process projector.
