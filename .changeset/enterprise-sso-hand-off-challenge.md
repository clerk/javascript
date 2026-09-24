---
'@clerk/clerk-js': patch
'@clerk/localizations': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Fix enterprise SSO sign-ins erroring instead of showing a verification challenge raised while handing off to the identity provider.

If you use the prebuilt `<SignIn />` component, there is nothing to do. If you have Clerk Protect enabled and call `signIn.authenticateWithRedirect()` or `signIn.authenticateWithPopup()` from a custom sign-in flow, catch a `ClerkRuntimeError` with code `protect_check_required` and show the verification challenge, to avoid a stalled sign-in.

That error means a verification challenge has to be completed before the sign-in can redirect. It replaces the generic "not supported" error these methods threw before. When it is thrown, the sign-in is gated: `signIn.protectCheck` is set, or its status is `needs_protect_check`. For enterprise SSO, run the challenge and then call `authenticateWithRedirect()` again with `continueSignIn: true`. If the server has already prepared the redirect, the sign-in continues to the identity provider and the challenge runs when it returns, so no error is thrown.
