---
'@clerk/tanstack-react-start': patch
---

feat(tanstack): Pass Cloudflare Workers env context to getEnvVariable

Adds `cloudflare:workers` module env resolution to the TanStack Start package, following the pattern used in `@clerk/react-router` where loader context is passed to `getEnvVariable()`. On Cloudflare Workers, `process.env` and `import.meta.env` are not available at runtime. This fix initializes the CF Workers env in `clerkMiddleware` and passes it through `commonEnvs()` → `getEnvVariable(name, context)` so `CLERK_SECRET_KEY` and other env vars are resolved correctly.
