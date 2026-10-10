---
'@clerk/backend': minor
---

`verifyToken()` and `verifyJwt()` now support an `issuer` option to validate a token's `iss` claim. Pass a string for an exact match, or a list of strings of which one must match. Validation is opt-in: when `issuer` is not provided, the `iss` claim is not checked and existing behavior is unchanged. `verifyJwt()` checks the option against whichever token it is given. `verifyToken()` and `authenticateRequest()` apply it to session tokens only: machine tokens (M2M, OAuth access tokens, API keys) are never checked against `issuer`, and their existing `audience` validation is unchanged.
