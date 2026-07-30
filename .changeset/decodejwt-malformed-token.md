---
'@clerk/backend': patch
---

Return a `TokenVerificationError` from `decodeJwt` and `verifyToken` for tokens whose header, payload, or signature cannot be decoded.
