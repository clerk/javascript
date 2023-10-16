---
'@clerk/backend': patch
---

Added new function `signJwt(payload, key, options)` for JWT token signing.
Also updated the existing `hasValidSignature` and `verifyJwt` method to handle PEM-formatted keys directly (previously they had to be converted to jwks).
For key compatibility, support is specifically confined to `RSA` types and formats `jwk, pkcs8, spki`.
