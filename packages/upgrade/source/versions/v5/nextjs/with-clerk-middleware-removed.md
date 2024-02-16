---
title: '`withClerkMiddleware` removed'
category: 'middleware'
matcher: "withClerkMiddleware\\("
---

`withClerkMiddleware` has been deprecated and is now removed in v5. We recommend moving to `clerkMiddleware` instead. Please read the [clerkMiddleware guide](https://clerk.com/docs/references/nextjs/clerk-middleware) for more details. Here’s an example of how a simple middleware setup might look before and after.

```js
// Before: using withClerkMiddleware
import { withClerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/', '/sign-in', '/sign-up'];

const isPublic = (path: string) => {
  return publicPaths.find(x => path.match(new RegExp(`^${x}$`.replace('*$', '($|/)'))));

  if (isPublic(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  const { userId } = getAuth(request);

  if (!userId) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }
};

export default withClerkMiddleware((req: NextRequest) => {
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!static|.*\\..*|_next|favicon.ico).*)', '/'],
};
```

```js
// After: using clerkMiddleware
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs';

const isPublicRoute = createRouteMatcher(['/', '/sign-in', '/sign-up']);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) return;

  auth().protect();
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```
