---
'@clerk/astro': minor
'@clerk/nuxt': minor
'@clerk/react-router': minor
'@clerk/tanstack-react-start': minor
---

In development, missing Clerk keys no longer activate keyless mode. When the framework's publishable/secret key environment variables are not set, the SDK now throws an error directing you to run `npx clerk@latest init`, which provisions a Clerk application and writes the keys to your env file. Existing apps with configured keys are unaffected.
