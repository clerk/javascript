---
'@clerk/react-router': major
---

Introduce React Router middleware support with `clerkMiddleware()` for improved performance and streaming capabilities.

Usage of `rootAuthLoader` without the `clerkMiddleware()` installed is now deprecated and will be removed in the next major version.

**Before (Deprecated - will be removed):**

```tsx
import { rootAuthLoader } from '@clerk/react-router/ssr.server'

export async function loader(args: Route.LoaderArgs) {
  return rootAuthLoader(args)
}
```

**After (Recommended):**
```tsx
import { clerkMiddleware, rootAuthLoader } from '@clerk/react-router/ssr.server'

export const middleware: Route.MiddlewareFunction[] = [
  clerkMiddleware()
]

export async function loader(args: Route.LoaderArgs) {
  return rootAuthLoader(args)
}
```

**Streaming Support (with middleware):**

```tsx
export const middleware: Route.MiddlewareFunction[] = [
  clerkMiddleware()
]

export async function loader(args: Route.LoaderArgs) {
  const nonCriticalData = new Promise((res) =>
    setTimeout(() => res("non-critical"), 5000),
  )

  return rootAuthLoader(args, () => ({
    nonCriticalData
  }))
}
```