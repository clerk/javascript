---
'@clerk/shared': patch
---

feat(shared): Add `cloudflare:workers` env fallback to `getEnvVariable`

Adds `initCloudflareWorkersEnv()` and a `cloudflare:workers` module env check to the shared `getEnvVariable()` function. This allows Clerk to read environment variables (e.g., `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`) directly from the Cloudflare Workers runtime environment, following the same pattern used in `@clerk/astro` (PRs #7889, #8136).

This is needed for frameworks running on Cloudflare Workers (e.g., TanStack Start, Hono) where `process.env` and `import.meta.env` are not available at runtime, but `cloudflare:workers` module env is.
