---
'@clerk/nextjs': patch
---

Do not run `invalidateCacheAction` on Next.js v15 during `onBeforeSetActive` due to v15's less aggressive router cache.
