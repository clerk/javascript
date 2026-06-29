# @clerk/eslint-plugin

## 0.2.0

### Minor Changes

- The `require-auth-protection` rule now matches `protected` and `public` globs relative to the project root, instead of relative to `app/`. You can specify `rootDir` to control the project root. ([#8942](https://github.com/clerk/javascript/pull/8942)) by [@Ephem](https://github.com/Ephem)

  **Breaking change:** If your project uses the `src/app/` folder structure, you need to rewrite your globs. For example, instead of `public: ['app/sign-in/**']`, use: `public: ['src/app/sign-in/**']`.

### Patch Changes

- Handle non-promise return types when `require-auth-protection` rule fixer makes the function `async`. ([#8941](https://github.com/clerk/javascript/pull/8941)) by [@Ephem](https://github.com/Ephem)

  The eslint rule fixer will now wrap a non-promise return type with `Promise<>` to produce valid TypeScript.

- The `require-auth-protection` fixer now matches the string quote style of existing imports when inserting a new `auth` import. ([#8941](https://github.com/clerk/javascript/pull/8941)) by [@Ephem](https://github.com/Ephem)

  Previously, new imports always used single quotes regardless of how other imports in the file were quoted.

- The `require-auth-protection` rule now accepts OR-conditions like `if (!isAuthenticated || otherCondition)` when determining if a resource is protected. ([#8941](https://github.com/clerk/javascript/pull/8941)) by [@Ephem](https://github.com/Ephem)

  Previously, only bare auth checks such as `if (!isAuthenticated)` were recognized. Guards with only `||` are safe but were incorrectly reported as missing protection.

## 0.1.0

### Minor Changes

- Add an experimental ESLint plugin `@clerk/eslint-plugin`, with a single `require-auth-protection` rule for the Next.js App router. This rule helps enforce auth protections are present at the page/route/server function level. ([#8704](https://github.com/clerk/javascript/pull/8704)) by [@Ephem](https://github.com/Ephem)

  The lint rule offers an editor quick-fix suggestion for unprotected resources that inserts `await auth.protect()` at the top of the function. Suggestions are opt-in and are not applied by `eslint --fix`.

  Includes a bulk auto-fixer, available as the `clerk-next-fix-auth-protection` command. It lints with your existing ESLint config and applies the `await auth.protect()` suggestion to every resource it can safely fix, reporting the rest as needing manual attention. Supports `--dry-run`.
