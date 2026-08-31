---
'@clerk/backend': patch
---

Reject JWT-template tokens presented as session tokens in the `Authorization` header when `acceptsToken` is `'any'` or an array that includes `'session_token'`. `authenticateRequest()` now returns a signed-out state with reason `token-type-mismatch` for such a token, matching the existing `acceptsToken: 'session_token'` behavior.
