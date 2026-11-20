---
'@clerk/ui': patch
---

Errors that a step of `<SignIn />` or `<SignUp />` hands to the screen it navigates to, such as a locked account or a blocked sign-in, now show when Clerk is loaded from the npm package and `window.Clerk` is not set.
