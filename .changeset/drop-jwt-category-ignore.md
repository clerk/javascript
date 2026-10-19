---
'@clerk/backend': patch
---

Stop accepting the legacy `cl_I7d4PD111III` JWT category as a session or handshake token. Clerk no longer issues it, so `authenticateRequest()` now returns a signed-out state with reason `token-type-mismatch` for a token carrying it, the same as for other non-session categories.
