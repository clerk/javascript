---
'@clerk/shared': minor
'@clerk/nextjs': minor
'@clerk/astro': minor
'@clerk/react-router': minor
'@clerk/tanstack-react-start': minor
'@clerk/express': minor
'@clerk/nuxt': minor
---

Remove `clerkJSUrl`, `clerkJSVersion`, `clerkUIUrl`, and `clerkUIVersion` props and replace with `__internal_clerkJSUrl`, `__internal_clerkJSVersion`, `__internal_clerkUIUrl`, and `__internal_clerkUIVersion` internal-only options. Use `@clerk/upgrade` to migrate.
