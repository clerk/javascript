---
'@clerk/clerk-js': patch
---

Fixes a bug in `Clerk.signOut()` that was preventing the after sign out redirect from occurring in Next.js v15.
