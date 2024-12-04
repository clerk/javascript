---
'@clerk/clerk-js': patch
---

Fixes an issue in `UserProfile` where a new email address could use the last submitted value from the previous form, leading to stale data being saved.
