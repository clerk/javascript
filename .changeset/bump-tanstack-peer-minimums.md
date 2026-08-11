---
'@clerk/tanstack-react-start': minor
---

Raise the minimum supported peer dependencies to `@tanstack/react-start@^1.167.17` and `@tanstack/react-router@^1.168.10`. TanStack Start 1.167.17 ensures request middleware context, such as the `auth` value provided by `clerkMiddleware()`, cannot be overridden by client-provided context in server function execution paths ([TanStack/router#7135](https://github.com/TanStack/router/pull/7135)).
