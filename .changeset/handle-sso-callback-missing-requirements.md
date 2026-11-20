---
'@clerk/react': patch
---

Fix `<HandleSSOCallback />` hanging when a sign-up started with `signUp.sso()` returns with missing requirements, such as a required legal acceptance or a missing username. The component now calls `navigateToSignUp()` so the sign-up page can collect the remaining fields.
