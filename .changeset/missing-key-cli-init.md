---
'@clerk/shared': patch
'@clerk/nextjs': patch
---

Update missing key error messages to recommend the Clerk CLI: `npx clerk@latest init` for setup, and `npx clerk@latest deploy` / `npx clerk@latest env pull --instance prod` when keys are missing in production Next.js environments.
