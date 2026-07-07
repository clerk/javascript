---
'@clerk/ui': patch
---

Fix standalone `<SignUp />` Protect checks so the verification card stays mounted while a solved challenge routes to the next step, while stale direct visits to the protect-check route return to the start of the sign-up flow.
