---
'@clerk/backend': minor
---

`authenticateRequest()` will now set a refreshsed session cookie on the response when an expired session token is refreshed via the Clerk API.
