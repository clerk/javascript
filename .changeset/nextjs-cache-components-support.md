---
'@clerk/nextjs': patch
---

Add support for Next.js 16 cache components by improving error detection and providing helpful error messages when `auth()` or `currentUser()` are called inside a `"use cache"` function.
