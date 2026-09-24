---
'@clerk/nuxt': patch
---

Fix `clerkMiddleware()` dropping all but the last `Set-Cookie` header when Clerk sets multiple cookies in one response, such as after a handshake or a session refresh.
