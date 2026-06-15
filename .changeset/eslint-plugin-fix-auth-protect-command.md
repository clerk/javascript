---
'@clerk/eslint-plugin': minor
---

Add a bulk auto-fixer for the `require-auth-protection` rule, available both as the `clerk-next-fix-auth-protection` command and as a `fixAuthProtection()` function exported from `@clerk/eslint-plugin/next/fix-auth-protection`. It lints with your existing ESLint config and applies the `await auth.protect()` suggestion to every resource it can safely fix, reporting the rest as needing manual attention. Supports `--dry-run`.
