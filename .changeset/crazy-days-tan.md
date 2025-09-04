---
'@clerk/clerk-js': patch
---

Fixes issue where "prepare" API request would only fire once, preventing end users from receiving fresh otp codes.
