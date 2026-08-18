---
'@clerk/nextjs': patch
---

`clerkMiddleware()` now points key misconfiguration at the Clerk CLI. Missing keys throw an error recommending `npx clerk@latest init`, with `npx clerk@latest deploy` / `npx clerk@latest env pull --instance prod` guidance for production (`code=missing_env_keys`). The publishable key format is also validated upfront (`code=invalid_env_keys`) instead of failing later with `Publishable key not valid.` The messages are the same in development and production.
