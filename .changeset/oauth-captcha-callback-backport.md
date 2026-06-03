---
'@clerk/clerk-js': patch
---

Fix new OAuth users hanging on the SSO callback. When an OAuth sign-in transfers to a sign-up, the captcha is now correctly bypassed for providers in the captcha OAuth bypass list, instead of unconditionally showing a captcha that could never be completed.
