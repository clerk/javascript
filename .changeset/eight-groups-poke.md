---
'@clerk/upgrade': minor
---

Add support for the latest versions of the following packages:
- `@clerk/react` (replacement for `@clerk/react`)
- `@clerk/expo` (replacement for `@clerk/expo`)
- `@clerk/nextjs`
- `@clerk/react-router`
- `@clerk/tanstack-start-react`

During the upgrade, imports of the `useSignIn()` and `useSignUp()` hooks will be updated to import from the `/legacy` subpath.
