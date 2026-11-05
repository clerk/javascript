---
'@clerk/clerk-js': patch
---

Fix users occasionally being signed out right after completing sign-up. `setActive({ session })` now rejects with a network error instead of signing the user out when it cannot confirm a newly created session.
