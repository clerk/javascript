---
'@clerk/eslint-plugin': patch
---

Handle non-promise return types when `require-auth-protection` rule fixer makes the function `async`.

The eslint rule fixer will now wrap a non-promise return type with `Promise<>` to produce valid TypeScript.
