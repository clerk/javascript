---
'@clerk/backend': patch
---

`authenticateRequest()` now returns a signed-out or handshake state instead of throwing when a token's header or payload is valid JSON but not a JSON object. For such tokens, `decodeJwt()`, `verifyJwt()`, and `verifyToken()` now throw a `TokenVerificationError` with reason `token-invalid`.
