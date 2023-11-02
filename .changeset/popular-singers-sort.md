---
'@clerk/clerk-sdk-node': major
---

Drop deprecations. Migration steps:

- use `CLERK_SECRET_KEY` instead of `CLERK_API_KEY` env variable
- use `secretKey` instead of `apiKey`
- use `CLERK_PUBLISHABLE_KEY` instead of `CLERK_FRONTEND_API` env variable
- use `publishableKey` instead of `frontendApi`
- drop Redwood hotfix (upgrade to latest version)
- use `createClerkClient` with options to create a new clerkClient instead of using
  the following setters:
    - `setClerkApiVersion`
    - `setClerkHttpOptions`
    - `setClerkServerApiUrl`
    - `setClerkApiKey`
- use `@clerk/clerk-sdk-node` instead of `@clerk/clerk-sdk-node/{cjs|esm}/instance`

Extra:
- bundle only index.ts and instance.ts