---
'@clerk/backend': patch
---

API key verification uses the SDK User-Agent instead of the incoming request's, so clients like Python urllib are not rejected by BAPI.
