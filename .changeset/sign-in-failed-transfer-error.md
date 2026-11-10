---
'@clerk/ui': patch
---

Fix `<SignIn />` showing "The External Account was not found." to a new user when the sign-up transfer after an OAuth sign-in fails, for example on a rate limit or a network error. The start screen now shows a generic error in that case. The "not found" message still appears when `transferable` is `false`.
