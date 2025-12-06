---
'@clerk/backend': patch
---

Fixes an issue with host header parsing that would cause Clerk to throw an exception when receiving malformed host values.
