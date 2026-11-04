---
'@clerk/react-router': minor
---

Remove the leftover `options` argument from `rootAuthLoader()`. It had no effect, since `rootAuthLoader` reads auth state from `clerkMiddleware()`. Pass options like `secretKey` or `signInUrl` to `clerkMiddleware()` instead. The `RootAuthLoaderOptions` type is also removed.
