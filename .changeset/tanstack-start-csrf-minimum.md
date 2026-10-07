---
'@clerk/tanstack-react-start': minor
---

Raise the minimum supported peer dependencies to `@tanstack/react-start@^1.168.10` and `@tanstack/react-router@^1.170.7`. Start 1.168.10 is the first version where importing `createCsrfMiddleware()` works reliably during Vite SSR.

TanStack Start skips its default CSRF protection for server functions when your app has a `src/start.ts`, which `clerkMiddleware()` requires. Register `createCsrfMiddleware()` before `clerkMiddleware()` to restore it:

```ts
import { clerkMiddleware } from '@clerk/tanstack-react-start/server';
import { createCsrfMiddleware, createStart } from '@tanstack/react-start';

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
});

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [csrfMiddleware, clerkMiddleware()],
  };
});
```
