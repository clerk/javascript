---
'@clerk/backend': patch
---

Clean up `auth().debug()` output so it handles all configured keys the same way and no longer includes the internal request object.
