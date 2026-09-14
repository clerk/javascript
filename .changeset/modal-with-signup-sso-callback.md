---
'@clerk/ui': patch
---

Fixed OAuth and Enterprise SSO sign-ups started from `openSignIn({ withSignUp: true })` or `<SignInButton mode="modal" withSignUp />`. The callback now returns to the sign-in page's `sso-callback` route, which completes the sign-up transfer. Previously it targeted a `create/sso-callback` route that only exists when that page mounts `<SignIn withSignUp />`, so new users landed on the sign-in form with an "External Account was not found" error instead of being signed up.
