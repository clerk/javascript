---
'@clerk/react-router': patch
---

In this release the TypeScript types for `rootAuthLoader()`, `getAuth()`, and `<ClerkProvider>` were adjusted but should still work as before. Previously, these types relied on internal, unstable React Router types that changed in their recent 7.6.1 release. We simplified our TypeScript types and no longer rely on internal exports from React Router.
