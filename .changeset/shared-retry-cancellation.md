---
'@clerk/shared': patch
---

The `retry` helper now supports cancellation and error-dependent backoff. Passing an `AbortSignal` via the new `signal` option cancels retrying, immediately interrupting any pending backoff delay, and `initialDelay` now also accepts a function deriving the backoff base delay from the error that triggered the retry.
