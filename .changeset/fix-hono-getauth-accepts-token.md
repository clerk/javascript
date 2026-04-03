---
'@clerk/hono': patch
---

Add support for `CLERK_MACHINE_SECRET_KEY` environment variable. This enables M2M token scope verification without needing to pass `machineSecretKey` explicitly to `clerkMiddleware()`.
