---
'@clerk/clerk-js': minor
'@clerk/shared': minor
---

Add retry attempt tracking to FAPI client GET requests

The FAPI client now adds a `_clerk_retry_attempt` query parameter to retry attempts for GET requests, allowing servers to track and handle retry scenarios appropriately. This parameter is only added during retry attempts, not on the initial request.
