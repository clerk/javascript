---
'@clerk/clerk-js': minor
'@clerk/types': minor
'@clerk/elements': patch
---

- `@clerk/clerk-js`, `@clerk/types`: Add `redirectUrl` option to `buildAfterSignInUrl()` and `buildAfterSignUpUrl()` methods.
- `@clerk/elements`: Ensure redirect_url params passed to Elements components are always passed to Clerk's underlying `build*Url()` methods.
