---
'@clerk/backend': patch
---

Preserve custom claims when verifying JWT-format M2M tokens. `M2MToken.fromJwtPayload` previously hardcoded `claims` to `null`, so `client.m2m.verify()` (and request-level `auth()`) dropped any custom claims embedded in the token. Custom claims are now reconstructed from the verified payload by excluding the reserved JWT/M2M structural claims (`iss`, `sub`, `aud`, `exp`, `nbf`, `iat`, `jti`, `scopes`). Tokens without custom claims still return `claims: null`, consistent with the opaque-token path.
