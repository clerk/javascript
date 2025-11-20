---
'@clerk/clerk-js': patch
---

Fix issue where network errors were being masked by fraud protection logic, preventing cache fallback from triggering properly.
