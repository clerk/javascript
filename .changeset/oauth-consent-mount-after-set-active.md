---
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Fix `<OAuthConsent />`, `<UserProfile />`, and other signed-in components rendering a blank page when they mount during a client-side navigation triggered by `setActive()`, such as the redirect after completing `<SignIn />` or `<SignUp />`.
