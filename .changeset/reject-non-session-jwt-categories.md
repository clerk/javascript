---
'@clerk/backend': patch
---

Reject JWT-template tokens where a session or handshake token is expected. `authenticateRequest()` now returns a signed-out state with reason `token-type-mismatch` for such a token in the `Authorization` header or `__session` cookie. Tokens with no category tag, and instances configured to omit it, are unaffected.
