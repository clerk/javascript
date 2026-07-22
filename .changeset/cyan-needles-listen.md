---
"@clerk/astro": patch
"@clerk/shared": patch
---

Fixed a bug where the `clerkMiddleware()` helper would consume the body of the request.
