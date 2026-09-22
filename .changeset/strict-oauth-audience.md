---
'@clerk/backend': minor
---

- Fixes an issue where OAuth token validation did not correctly validate audience (`aud`) claims. Previous usages that specified `audience` were falsely passing. This upgrade will cause those to start rejecting if the `audience` indeed does not match the OAuth token's `aud` claim, including cases where the `aud` claim is omitted.
- Adds an optional `audience` parameter to `idPOAuthAccessToken.verify()`
