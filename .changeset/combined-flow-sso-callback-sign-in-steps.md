---
'@clerk/ui': patch
---

Fixed `<SignIn />` in the combined sign-in-or-up flow sending users back to the start after an OAuth or SAML redirect when the sign-in still needed a step, such as a Clerk Protect check, a second factor, or a password reset. Sign-ups created from an OAuth sign-in, including after a Protect check, now continue to their remaining steps inside the component.
