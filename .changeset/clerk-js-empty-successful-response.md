---
'@clerk/clerk-js': patch
---

Accept a successful Frontend API response with an empty body. The request now resolves with a `null` payload and runs its response callbacks, as it does for a `204 No Content` response, instead of failing to parse the empty body as JSON.
