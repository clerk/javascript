---
'@clerk/nuxt': patch
---
Fix `clerkMiddleware` returning an unhandled 500 for request paths starting with `//` followed by an invalid host character (for example `//%5coast.me`). These requests now return a 400 Bad Request, matching other malformed URLs.
