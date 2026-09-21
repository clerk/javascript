---
'@clerk/backend': minor
---

- Fixes an issue where OAuth token validation did not correctly validate audience (`aud`) claims.
- Adds an optional `audience` parameter to `idPOAuthAccessToken.verify()`
