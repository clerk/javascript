---
'@clerk/clerk-js': patch
---

Fix issue where `signUp.password()` created a new sign-up when called after `signUp.create()`
