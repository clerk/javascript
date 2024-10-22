---
"@clerk/nextjs": major
---

Stop `<ClerkProvider>` from opting applications into dynamic rendering. A new prop, `<ClerkProvider dynamic>` can be used to opt-in to dynamic rendering and make auth data available during server-side rendering. The RSC `auth()` helper should be preferred for accessing auth data during dynamic rendering.
