# @clerk/eslint-plugin

## 0.1.0

### Minor Changes

- Add an experimental ESLint plugin `@clerk/eslint-plugin`, with a single `require-auth-protection` rule for the Next.js App router. This rule helps enforce auth protections are present at the page/route/server function level. ([#8704](https://github.com/clerk/javascript/pull/8704)) by [@Ephem](https://github.com/Ephem)

  The lint rule offers an editor quick-fix suggestion for unprotected resources that inserts `await auth.protect()` at the top of the function. Suggestions are opt-in and are not applied by `eslint --fix`.

  Includes a bulk auto-fixer, available as the `clerk-next-fix-auth-protection` command. It lints with your existing ESLint config and applies the `await auth.protect()` suggestion to every resource it can safely fix, reporting the rest as needing manual attention. Supports `--dry-run`.
