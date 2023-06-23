---
'@clerk/nextjs': patch
---

Support hosting NextJs apps on non-Vercel platforms by constructing req.url using host-related headers instead of using on `req.url` directly. In order to enable this feature, set the `CLERK_TRUST_HOST` env variable to `true` 
