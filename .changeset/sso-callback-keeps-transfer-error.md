---
'@clerk/ui': patch
---

Fix `<SignIn />` showing "The External Account was not found." to new users when the sign-up transfer after an OAuth sign-in fails, for example when a firewall or rate limit blocks the request. The start screen now keeps the error shown on the SSO callback screen. The "not found" message still appears when transfers are turned off with `transferable={false}`.
