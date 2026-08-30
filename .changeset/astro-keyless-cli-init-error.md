---
'@clerk/astro': minor
'@clerk/shared': patch
---

In development, missing Clerk keys no longer activate keyless mode. When `PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are not set, the SDK now fails with an error directing you to run `npx clerk@latest init`, which provisions a Clerk application and writes the keys to `.env`. Existing apps with configured or claimed keys are unaffected.
