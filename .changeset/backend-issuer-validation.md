---
'@clerk/backend': minor
---

Added an optional `issuer` option to `verifyJwt()`, `verifyToken()`, and `authenticateRequest()` to validate the JWT `iss` claim against a string or list of allowed strings. For `verifyToken()` and `authenticateRequest()`, this applies only to session tokens. Omitting `issuer` preserves existing behavior.
