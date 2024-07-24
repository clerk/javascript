---
"@clerk/astro": patch
---

Allow the handler of `clerkMiddleware` to return undefined. When undefined is returned, `clerkMiddleware` implicitly calls `await next()`.
