---
'@clerk/eslint-plugin': minor
---

The `require-auth-protection` rule now matches `protected` and `public` globs relative to the project root, instead of relative to `app/`. You can specify `rootDir` to control the project root.

**Breaking change:** If your project uses the `src/app/` folder structure, you need to rewrite your globs. For example, instead of `public: ['app/sign-in/**']`, use: `public: ['src/app/sign-in/**']`.
