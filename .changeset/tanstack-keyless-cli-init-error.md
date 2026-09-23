---
'@clerk/tanstack-react-start': minor
---

In development, missing Clerk keys no longer activate keyless mode. When `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are not set, the SDK now fails with an error directing you to run `npx clerk@latest init`, which provisions a Clerk application and writes the keys to `.env.local`. Keys that keyless mode stored in the `.clerk/` directory are no longer read, and `VITE_CLERK_KEYLESS_DISABLED` and `CLERK_KEYLESS_DISABLED` no longer have any effect. Existing apps with configured keys are unaffected.
