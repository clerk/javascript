---
"@clerk/nextjs": major
---

Support `unstable_rethrow` inside `clerkMiddleware`.
We changed the errors thrown by `protect()` inside `clerkMiddleware` in order for `unstable_rethrow` to recognise them and rethrow them.
