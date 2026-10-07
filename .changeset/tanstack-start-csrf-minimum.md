---
'@clerk/tanstack-react-start': minor
---

Raise the minimum supported peer dependencies to `@tanstack/react-start@^1.168.0` and `@tanstack/react-router@^1.170.0`. Start 1.168.0 is the first version that exports `createCsrfMiddleware()`.

TanStack Start skips its default CSRF protection for server functions when your app has a `src/start.ts`, which `clerkMiddleware()` requires. Register `createCsrfMiddleware()` before `clerkMiddleware()` to restore it:

```ts
import { createCsrfMiddleware, createStart } from '@tanstack/react-start';
import { clerkMiddleware } from '@clerk/tanstack-react-start/server';

const csrfMiddleware = createCsrfMiddleware({
  filter: (context) => context.handlerType === 'serverFn',
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, clerkMiddleware()],
}));
```
