---
"@clerk/nextjs": patch
---

Bug fix: Handle `nextGetStore.getStore()` returning `undefined`. Previously a TypeError would occur, when `pagePath` was accessed.
