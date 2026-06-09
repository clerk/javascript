---
'@clerk/backend': patch
---

Prevent an unhandled exception when verifying a machine token whose JWT payload has a missing or non-string `sub`. Such tokens are now classified and rejected with a typed verification error instead of throwing, so a crafted `Authorization` header can no longer surface as an unhandled error during request authentication.
