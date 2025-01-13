---
'@clerk/nextjs': patch
---

Bug fix: Avoid infinite redirect loop on Keyless mode by detecting if `clerkMiddleware()` is used in the application.
