---
'@clerk/clerk-js': patch
---

Fix `signUp.password()` on the future SignUp API not defaulting the sign-up's `locale` to the browser locale when it creates a new sign-up, matching the documented behavior and `signUp.create()`. An explicitly passed `locale` still takes precedence, and updates to an existing sign-up remain unaffected.
