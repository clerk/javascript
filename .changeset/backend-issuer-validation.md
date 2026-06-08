---
'@clerk/backend': minor
---

`verifyToken()` and `verifyJwt()` now support an `issuer` option to validate a token's `iss` claim. Pass a string for an exact match, or a list of strings of which one must match. Validation is opt-in: when `issuer` is not provided, the `iss` claim is not checked and existing behavior is unchanged. The option only applies to session-token verification; machine tokens (M2M, OAuth access tokens, API keys) are unaffected.
