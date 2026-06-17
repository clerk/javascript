---
'@clerk/eslint-plugin': minor
---

Add an experimental ESLint plugin `@clerk/eslint-plugin`, with a single `require-auth-protection` rule for the Next.js App router. This rule helps enforce auth protections are present at the page/route/server function level.

The lint rule offers an editor quick-fix suggestion for unprotected resources that inserts `await auth.protect()` at the top of the function. Suggestions are opt-in and are not applied by `eslint --fix`.

Includes a bulk auto-fixer, available as the `clerk-next-fix-auth-protection` command. It lints with your existing ESLint config and applies the `await auth.protect()` suggestion to every resource it can safely fix, reporting the rest as needing manual attention. Supports `--dry-run`.
