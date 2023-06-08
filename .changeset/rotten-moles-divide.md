---
'@clerk/shared': minor
'@clerk/clerk-react': minor
'@clerk/clerk-js': patch
'@clerk/nextjs': patch
'@clerk/remix': patch
---

ESM/CJS support for `@clerk/clerk-react`
Changes that should affect users and OS contributors:
- Better source map support for `@clerk/clerk-react`, `@clerk/shared`. This affects anyone developing in our monorepo or anyone using a debugger with Clerk installed in their app.
- Easier node_modules debugging as `@clerk/clerk-react`, `@clerk/shared` and `@clerk/nextjs` are no longer getting bundled as a single-file package. This also improves error logging in nextjs a lot, as nextjs usually logs the line that threw the error - a minified, single-file package, usually consists of a very long single-line module, so logging error in NextJS wasn't ideal.
- Headless clerk-js bundle size reduced by ~10kb, normal clerk-ks by ~6kb
- A new `clerkJSVersion` prop has been added on ClerkProvider allowing to fetch a specific clerk-js version.
