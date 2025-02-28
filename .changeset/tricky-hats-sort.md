---
'@clerk/backend': patch
---

Bug fix: Properly remove `Authorization` header on requests that don't require a secret key.
