---
'@clerk/shared': patch
'@clerk/nextjs': patch
---

Invalid publishable key errors now recommend the Clerk CLI: the shared invalid-key message points at `npx clerk@latest init`, and `clerkMiddleware()` validates the publishable key format upfront, throwing a setup error in development (`npx clerk@latest init`) or a deploy-oriented error in production (`npx clerk@latest env pull --instance prod`) instead of failing later with `Publishable key not valid.`
