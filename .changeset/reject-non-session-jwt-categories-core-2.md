---
'@clerk/backend': patch
'@clerk/shared': patch
---

Reject JWTs of another category, such as JWT templates, M2M tokens and OIDC ID tokens, where a session or handshake token is expected. `authenticateRequest()` now returns a signed-out state with reason `token-type-mismatch` for such a token in the `Authorization` header or `__session` cookie. Tokens with no category tag are unaffected.
