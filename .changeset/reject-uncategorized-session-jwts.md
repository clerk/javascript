---
'@clerk/backend': patch
---

Reject JWTs that carry no `cat` header where a session token is expected. Clerk stamps every session token with a category, so a validly signed JWT without one, such as an OIDC `id_token` issued to a third-party OAuth client, is not a session token. `authenticateRequest()` now returns a signed-out state with reason `token-type-mismatch` for such a token in the `Authorization` header or `__session` cookie, and `verifyToken()` returns a `token-invalid` error. JWT-template tokens remain verifiable through `verifyToken()`. Self-signed test tokens must now include `cat: 'cl_B7d4PD111AAA'` in their header to be accepted as session tokens.
