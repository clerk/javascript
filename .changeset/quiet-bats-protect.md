---
'@clerk/react-router': major
---

Introduce [React Router middleware](https://reactrouter.com/how-to/middleware) support with `clerkMiddleware()` for improved performance and streaming capabilities.

Usage of `rootAuthLoader` without the `clerkMiddleware()` installed is now deprecated and will be removed in the next major version.

**Before (Deprecated - will be removed):**

```tsx
import { rootAuthLoader } from '@clerk/react-router/ssr.server'

export const loader = (args: Route.LoaderArgs) => rootAuthLoader(args)
```

**After (Recommended):**

1. Enable the `v8_middleware` future flag:

```ts
// react-router.config.ts
export default {
  future: {
    v8_middleware: true,
  },
} satisfies Config;
```

2. Use the middleware in your app:

```tsx
import { clerkMiddleware, rootAuthLoader } from '@clerk/react-router/server'

export const middleware: Route.MiddlewareFunction[] = [clerkMiddleware()]

export const loader = (args: Route.LoaderArgs) => rootAuthLoader(args)
```

**Streaming Support (with middleware):**

```tsx
export const middleware: Route.MiddlewareFunction[] = [clerkMiddleware()]

export const loader = (args: Route.LoaderArgs) => {
  const nonCriticalData = new Promise((res) =>
    setTimeout(() => res('non-critical'), 5000),
  )

  return rootAuthLoader(args, () => ({
    nonCriticalData
  }))
}
```