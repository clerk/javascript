---
'@clerk/eslint-plugin': minor
---

The `require-auth-protection` rule now offers an editor quick-fix suggestion for unprotected resources that inserts `await auth.protect()` at the top of the function. Suggestions are opt-in and are not applied by `eslint --fix`.
