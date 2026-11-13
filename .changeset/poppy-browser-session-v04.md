---
"@clerk/backend": minor
"@clerk/nextjs": minor
---

Add support for Personal Agent Protocol signed-in browser sessions. Enable the Clerk-defined `__experimental_poppy: true` option on `clerkMiddleware()` to publish Poppy and OAuth protected resource discovery on the application domain.

Expose `agent` on the auth object when an agent session is active.
