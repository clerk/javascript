---
"@clerk/nextjs": patch
---

Improved `auth()` error message when `clerkMiddleware()` is not detected to mention that infrastructure issues (e.g. edge runtime errors or platform outages) can also cause this error.
