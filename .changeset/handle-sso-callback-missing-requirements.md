---
'@clerk/react': patch
---

Fix `<HandleSSOCallback />` hanging when a sign-up started with `signUp.sso()` returns needing another step, such as a required legal acceptance, a missing username or an unverified email address. The component now calls `navigateToSignUp()` so your sign-up page can resume that attempt.
