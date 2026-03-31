---
"@clerk/nuxt": patch
---

Derive `apiUrl` from the publishable key using `apiUrlFromPublishableKey()`, matching the behavior of other Clerk SDKs (`@clerk/nextjs`, `@clerk/astro`, etc.). Staging publishable keys (with `.accountsstage.dev`) now automatically route to `https://api.clerkstage.dev` without requiring a manual `NUXT_PUBLIC_CLERK_API_URL` override. Explicit `apiUrl` configuration still takes priority.
