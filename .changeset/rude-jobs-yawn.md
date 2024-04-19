---
'@clerk/nextjs': patch
'@clerk/remix': patch
'@clerk/shared': patch
'@clerk/fastify': patch
---

Improve the default value for `CLERK_API_URL` by utilizing the publishable key to differentiate between local, staging and prod environments.
