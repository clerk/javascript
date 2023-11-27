---
'@clerk/clerk-js': major
'@clerk/shared': major
'@clerk/clerk-sdk-node': minor
'@clerk/backend': minor
'@clerk/nextjs': minor
'@clerk/clerk-react': minor
'@clerk/clerk-expo': minor
---

Breaking Changes:

- Drop `isLegacyFrontendApiKey` from `@clerk/shared`
- Drop default exports from `@clerk/clerk-js`
    - on headless Clerk type
    - on ui and ui.retheme `Portal`
- Use `isProductionFromSecretKey` instead of `isProductionFromApiKey`
- Use `isDevelopmentFromSecretKey` instead of `isDevelopmentFromApiKey`

Changes:

- Rename `HeadlessBrowserClerkConstrutor` / `HeadlessBrowserClerkConstructor` (typo)
- Use `isomorphicAtob` / `isomorhpicBtoa` to replace `base-64` in `@clerk/expo`
- Refactor merging build-time and runtime props in `@clerk/backend` clerk client
- Drop `node-fetch` dependency from `@clerk/backend`
- Drop duplicate test in `@clerk/backend`