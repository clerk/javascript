---
'@clerk/nextjs': patch
---

Fix `setActive()` hanging forever in App Router apps when the cache invalidation server action fails, for example in a tab opened before a redeploy or on a network error.
