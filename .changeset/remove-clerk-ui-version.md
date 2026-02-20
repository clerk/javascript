---
'@clerk/shared': minor
'@clerk/nextjs': minor
'@clerk/astro': minor
'@clerk/react-router': minor
'@clerk/tanstack-react-start': minor
'@clerk/express': minor
'@clerk/nuxt': minor
---

Remove `clerkUIVersion` and `clerkJSVersion` props across all SDKs. Use `@clerk/upgrade` to migrate to the new `__internal_` prefixed props if needed.
