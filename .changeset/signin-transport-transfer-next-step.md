---
'@clerk/ui': patch
---

Route an OAuth transfer to the sign-up continue step when sign-in uses a native OAuth transport. The callback previously navigated with hash-style URLs (`<sign-up-url>#/continue`) that the in-place component router cannot resolve, landing transferred sign-ups on the start card where submitting created a fresh sign-up without the verified external account.
