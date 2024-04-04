---
'@clerk/clerk-js': patch
---

Avoid depending on `count` as it can be zero but invitations may still exist.
