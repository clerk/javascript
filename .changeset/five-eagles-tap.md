---
'@clerk/backend': patch
---

The JWT claims are verified after the signature to avoid leaking information through error messages on forged tokens.
