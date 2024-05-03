---
'@clerk/backend': patch
---

Fix bug in JWKS cache logic that caused a race condition resulting in no JWK being available.
