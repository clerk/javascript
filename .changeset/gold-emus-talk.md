---
"@clerk/clerk-js": minor
"@clerk/types": minor
"@clerk/clerk-react": minor
---

Introduce `transferable` prop for `<SignIn />` to disable the automatic transfer of a sign in attempt to a sign up attempt when attempting to sign in with a social provider when the account does not exist. Also adds a `transferable` option to `Clerk.handleRedirectCallback()` with the same functionality.
