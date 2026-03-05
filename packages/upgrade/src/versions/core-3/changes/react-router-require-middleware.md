---
title: '`rootAuthLoader` requires `clerkMiddleware()` in React Router'
packages: ['react-router']
matcher: 'rootAuthLoader'
category: 'breaking'
---

`rootAuthLoader` now requires `clerkMiddleware()` to be installed. Using `rootAuthLoader` without middleware will throw a runtime error.

### Before (Core 2)

```tsx
import { rootAuthLoader } from '@clerk/react-router/ssr.server';

export const loader = (args: Route.LoaderArgs) => rootAuthLoader(args);
```

### After (Core 3)

1. Enable the `v8_middleware` future flag:

```ts
// react-router.config.ts
export default {
  future: {
    v8_middleware: true,
  },
} satisfies Config;
```

2. Use `clerkMiddleware()` alongside `rootAuthLoader`:

```tsx
import { clerkMiddleware, rootAuthLoader } from '@clerk/react-router/server';

export const middleware: Route.MiddlewareFunction[] = [clerkMiddleware()];

export const loader = (args: Route.LoaderArgs) => rootAuthLoader(args);
```
