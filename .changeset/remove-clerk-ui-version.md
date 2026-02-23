---
'@clerk/shared': major
'@clerk/nextjs': major
'@clerk/astro': major
'@clerk/react-router': major
'@clerk/tanstack-react-start': major
'@clerk/express': major
'@clerk/nuxt': major
---

Remove `clerkUIVersion` and `clerkJSVersion` props across all SDKs. Use `@clerk/upgrade` to migrate to the new `__internal_` prefixed props if needed.
