---
'@clerk/nextjs': patch
---

Fix `setActive()` and `signOut()` hanging forever in App Router apps when the cache invalidation server action fails, for example after a redeploy or on a network error.
