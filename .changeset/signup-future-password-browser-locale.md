---
'@clerk/clerk-js': patch
---

Fix the future SignUp API dropping documented params in some flows:

- `signUp.password()` and `signUp.sso()` now default the sign-up's `locale` to the browser locale when they create a new sign-up, matching the documented behavior and `signUp.create()`. An explicitly passed `locale` still takes precedence, and updates to an existing sign-up remain unaffected.
- `signUp.web3()` now forwards the `firstName`, `lastName`, and `locale` params to the created sign-up instead of silently ignoring them.
