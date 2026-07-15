---
'@clerk/backend': patch
'@clerk/nextjs': patch
'@clerk/shared': patch
---

Add `CLERK_DISABLE_AUTO_PROXY=true` to opt out of automatic Frontend API proxying on Vercel production deployments.
