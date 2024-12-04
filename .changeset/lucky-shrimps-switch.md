---
'@clerk/clerk-js': patch
---

Fixes an issue in `UserProfile` where email and username forms could retain stale values from the previous render, leading to incorrect data being sent to FAPI
