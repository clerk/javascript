---
'@clerk/nextjs': patch
---

Export `<HandleSSOCallback />` from `@clerk/nextjs`. Previously, importing it from `@clerk/nextjs` failed, so it could not be used on the SSO callback route of a custom flow.
