---
'@clerk/react-router': major
---

Usage of `rootAuthLoader` without the `clerkMiddleware()` installed will not throw a runtime error.

**Before (Removed):**

```tsx
import { rootAuthLoader } from '@clerk/react-router/ssr.server'

export const loader = (args: Route.LoaderArgs) => rootAuthLoader(args)
```

**After:**

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
