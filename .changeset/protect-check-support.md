---
'@clerk/clerk-js': minor
'@clerk/localizations': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

Add support for Clerk Protect mid-flow SDK challenges (`protect_check`) on both sign-up and sign-in.

When the Protect antifraud service issues a challenge, responses now carry a `protectCheck` field
with `{ status, token, sdkUrl, expiresAt?, uiHints? }`. Clients resolve the gate by loading the
SDK at `sdkUrl`, executing the challenge, and submitting the resulting proof token via
`signUp.submitProtectCheck({ proofToken })` or `signIn.submitProtectCheck({ proofToken })`. The
response may carry a chained challenge, which the SDK resolves iteratively.

Sign-in adds a new `'needs_protect_check'` value to the `SignInStatus` union, surfaced when the
server-side SDK-version gate is enabled. Clients should treat the `protectCheck` field as the
authoritative gate signal and fall back to the status value for defense in depth.

The pre-built `<SignIn />` and `<SignUp />` components handle the gate automatically by routing
to a new `protect-check` route that runs the challenge SDK and resumes the flow on completion.
