---
title: '`authMiddleware` deprecated'
matcher: "import\\s+{[^}]*?authMiddleware[\\s\\S]*?}\\s+from\\s+['\"]@clerk\\/nextjs[\\s\\S]*?['\"]"
category: 'middleware'
matcherFlags: 'm'
warning: true
---

The [`authMiddleware`](https://clerk.com/docs/references/nextjs/auth-middleware) API from `@clerk/nextjs` has been marked as deprecated. We highly recommend using [`clerkMiddleware`](https://clerk.com/docs/references/nextjs/clerk-middleware) going forward. `clerkMiddleware` protects no routes by default and you need to add your individual routes you want to opt into protection. Here's an example of having all routes public except for everything under `/dashboard`.

For more documentation on the new `clerkMiddleware` function, check out [our official docs](https://clerk.com/docs/references/nextjs/clerk-middleware)!

**Before:**

```ts
// middleware.ts

import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: req => !req.url.includes('/dashboard'),
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

**After:**

```ts
// middleware.ts

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request)) {
    auth().protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```
