---
'@clerk/clerk-js': patch
---

Fixes a scenario where the session token would not immediately update after a call to `Clerk.session.touch()`.
