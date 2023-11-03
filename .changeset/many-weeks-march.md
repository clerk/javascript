---
'@clerk/remix': major
---

Drop deprecations. Migration steps:

- use `CLERK_SECRET_KEY` instead of `CLERK_API_KEY` env variable
- use `secretKey` instead of `apiKey`
- use `CLERK_PUBLISHABLE_KEY` instead of `CLERK_FRONTEND_API` env variable
- use `publishableKey` instead of `frontendApi`
