---
'@clerk/react-router': minor
---

Remove the `options` argument from `rootAuthLoader()`. It had no effect, since `rootAuthLoader` reads auth state from `clerkMiddleware()`. Pass options like `secretKey` or `signInUrl` to `clerkMiddleware()` instead. The `rootAuthLoader()` callback request no longer types `request.user`, `request.session`, or `request.organization`, because they were always `undefined`. `RootAuthLoaderOptions` is deprecated in favor of `ClerkMiddlewareOptions`.
