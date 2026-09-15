---
'@clerk/ui': patch
---

Fixed OAuth sign-ups from `openSignIn({ withSignUp: true })` landing on the sign-in page with an "External Account was not found" error instead of creating the account.
