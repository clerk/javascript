---
'@clerk/shared': minor
'@clerk/clerk-react': minor
'@clerk/clerk-js': patch
'@clerk/nextjs': patch
'@clerk/remix': patch
---

Notable changes:
- Resolve circular imports in clerk/shared
- New esm/cjs build pipeline for clerk/shared
- New esm/cjs build pipeline for clerk/clerk-react
- Refactor clerk-js loader logic in `@clerk/clerk-react`
- Introduce `clerkJSVersion` prop on ClerkProvider
- Enable isolatedModules for `@clerk/nextjs`
- Improved ESM support for `clerk-js` (reduces the bundle size by ~10kb)

Changes that should affect users and OS contributors:
- Better source map support for the affected packages. This affects anyone developing in our monorepo or anyone using a debugger with Clerk installed in their app.
- Easier node_modules debugging as `@clerk/clerk-react`, `@clerk/shared` and `@clerk/nextjs` are no longer getting bundled as a single-file package. This also improves error logging in nextjs a lot, as nextjs usually logs the line that threw the error - a minified, single-file package, usually consists of a very long single-line module, so logging error in NextJS wasn't ideal.
- Headless clerk-js bundle size reduced by ~10kb, normal clerkjs by ~6kb
