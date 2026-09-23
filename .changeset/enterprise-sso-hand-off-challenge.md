---
'@clerk/clerk-js': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Fix enterprise SSO sign-ins erroring instead of showing a verification challenge raised while handing off to the identity provider.

`signIn.authenticateWithRedirect()` now throws a `ClerkRuntimeError` with code `protect_check_required` when a verification challenge has to be completed first, instead of a generic "not supported" error. `signIn.protectCheck` is set when this happens, so custom flows can run the challenge and then call `authenticateWithRedirect()` again with `continueSignIn: true`.
