---
'@clerk/ui': patch
---

Fixed `<SignIn />` in the combined sign-in-or-up flow restarting the sign-in after an OAuth or SAML redirect when the sign-in needed a Clerk Protect check, a first or second factor, or a password reset. The callback now continues to that step instead of returning to the start of the flow, which previously caused a loop for users who were asked to complete a Protect check.
