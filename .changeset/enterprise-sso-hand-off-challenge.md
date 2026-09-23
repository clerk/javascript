---
'@clerk/clerk-js': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Fix enterprise SSO sign-ins erroring instead of showing a verification challenge raised while handing off to the identity provider.

When a verification challenge has to be completed before `signIn.authenticateWithRedirect()` or `signIn.authenticateWithPopup()` can redirect, they now throw a `ClerkRuntimeError` with code `protect_check_required` instead of a generic "not supported" error. The sign-in is gated when this happens (`signIn.protectCheck` is set, or its status is `needs_protect_check`). For enterprise SSO, run the challenge and call `authenticateWithRedirect()` again with `continueSignIn: true`. If the server has already prepared the redirect, the sign-in continues to the identity provider and the challenge runs when it returns.
