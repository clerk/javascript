---
'@clerk/nextjs': patch
---

Bug fix when signing out on Next.js v15. The less aggressive router cache on v15 allows us to resolve immediately.
