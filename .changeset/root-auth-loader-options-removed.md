---
'@clerk/react-router': patch
---

Remove the unused `options` argument from the `rootAuthLoader()` types. `rootAuthLoader` reads auth state from `clerkMiddleware()` and has ignored these options since v3, so values like `secretKey`, `signInUrl`, or `loadUser` passed to it had no effect. TypeScript now reports these calls, so you can move the options to `clerkMiddleware()`. The `RootAuthLoaderOptions` type is removed, and `request.user`, `request.session`, and `request.organization` are no longer typed on the callback request, because their runtime value was always `undefined`. Existing calls that still pass options keep working at runtime.
