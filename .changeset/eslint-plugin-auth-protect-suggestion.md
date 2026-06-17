---
'@clerk/eslint-plugin': minor
---

The `require-auth-protection` rule now offers an editor quick-fix suggestion for unprotected resources that inserts `await auth.protect()` at the top of the function. Suggestions are opt-in and are not applied by `eslint --fix`.

Also adds a bulk auto-fixer for the `require-auth-protection` rule, available as the `clerk-next-fix-auth-protection` command. It lints with your existing ESLint config and applies the `await auth.protect()` suggestion to every resource it can safely fix, reporting the rest as needing manual attention. Supports `--dry-run`.
