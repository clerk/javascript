---
'@clerk/backend': patch
---

Emit the "session token from cookie is missing the `azp` claim" warning once per process instead of on every authenticated request. An `azp`-less cookie token is reused across requests, so the previous unguarded `console.warn` could flood production logs.
