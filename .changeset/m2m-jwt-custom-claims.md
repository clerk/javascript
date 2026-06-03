---
'@clerk/backend': patch
---

Preserve custom claims when verifying JWT-format M2M tokens. `M2MToken.fromJwtPayload` previously hardcoded `claims` to `null`, so `client.m2m.verify()` (and request-level `auth()`) dropped any custom claims embedded in the token. Custom claims are now reconstructed from the verified payload by stripping only the structural claims the backend adds when minting the token (`iss`, `sub`, `exp`, `nbf`, `iat`, `jti`). User-supplied claims such as `aud` are preserved. Tokens without custom claims still return `claims: null`, consistent with the opaque-token path.
