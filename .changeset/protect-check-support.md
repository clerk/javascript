---
'@clerk/clerk-js': minor
'@clerk/localizations': minor
'@clerk/react': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

Add support for Clerk Protect mid-flow SDK challenges (`protect_check`) on both sign-up and sign-in.

When the Protect antifraud service issues a challenge, responses now carry a `protectCheck` field
with `{ status, token, sdkUrl, expiresAt?, uiHints? }`. Clients resolve the gate by loading the
SDK at `sdkUrl`, executing the challenge, and submitting the resulting proof token via
`signUp.submitProtectCheck({ proofToken })` or `signIn.submitProtectCheck({ proofToken })`. The
response may carry a chained challenge, which the SDK resolves iteratively.

Sign-in adds a new `'needs_protect_check'` value to the `SignInStatus` union. **Upgrading this
package is type-only and does not change runtime behavior**: the server returns the new status
(and the `protectCheck` field) only for instances where Protect mid-flow challenges have been
explicitly enabled — the feature is off by default and is not enabled for existing instances by
upgrading. The server additionally only emits the new status value to SDK versions that
understand it, so older clients never receive an unknown status.

If an exhaustive `switch` on `signIn.status` flags the new value after upgrading, handle it by
running the challenge described by `protectCheck` and submitting the proof via
`submitProtectCheck()`. Clients should treat the `protectCheck` field as the authoritative gate
signal and fall back to the status value for defense in depth.

The pre-built `<SignIn />` and `<SignUp />` components handle the gate automatically by routing
to a new `protect-check` route that runs the challenge SDK and resumes the flow on completion.
