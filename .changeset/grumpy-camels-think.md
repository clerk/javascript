---
'@clerk/clerk-react': minor
---

Various internal changes have been made to support a new feature called "Keyless mode". You'll be able to use this feature with Next.js and `@clerk/nextjs` initially. Read the `@clerk/nextjs` changelog to learn more.

List of changes:
- A new internal prop called `__internal_bypassMissingPublishableKey` has been added. Normally an error is thrown when the publishable key is missing, this disables this behavior.
- Loading of `clerk-js` won't be attempted when a missing key is present
- A new instance of `IsomorphicClerk` (an internal Clerk class) is created for each new publishable key
