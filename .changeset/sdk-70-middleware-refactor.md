---
'@clerk/nextjs': patch
---

Refactor `clerkMiddleware` internals to factor the post-authentication pipeline (handler invocation, CSP, redirects, response decoration) into a private `runHandlerWithRequestState` helper. Pure refactor — no behavioral change.
