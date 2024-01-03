---
'@clerk/nextjs': patch
---

Introduce the new `clerkMiddleware` helper to allow for more flexibility in how Clerk is integrated into your Next.js middleware. Example usage can be found below, for more details, For more details, please see the [clerkMiddleware](https://clerk.com/docs/references/nextjs/clerkMiddleware) documentation.
The `clerkMiddleware` helper effectively replaces the older `authMiddleware` helper, which is now considered deprecated and will be removed in the next major release.

### 1. Protect a route that requires authentication

```js
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(auth => {
  const { userId } = auth().protect();
  // userId is now available for use in your route handler
  // for page requests, calling protect will automatically redirect the user to the sign-in URL if they are not authenticated
  return NextResponse.next();
});
```


### 2. Protect a route that requires specific permissions

```js
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(auth => {
  const { userId } = auth().protect({ permission: 'org:domains:delete'});
  // userId is now available for use in your route handler
  // for page requests, calling protect will automatically throw a notFound error if the user does not have the required permissions
  return NextResponse.next();
});
```

### 2. Manually redirect to sign-in URL using the redirectToSignIn helper

```js
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(auth => {
  // If you want more fine-grained control, you can always use the low-level redirectToSignIn helper
  if(!auth().userId) {
    return auth().redirectToSignIn();
  }
  
  return NextResponse.next();
});
```

This commit also introduces the experimental `createRouteMatcher` helper, which can be used to create a route matcher that matches a route against the current request. This is useful for creating custom logic based on which routes you want to handle as protected or public.

```js
import { clerkMiddleware, experimental_createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = experimental_createRouteMatcher([/protected.*/]);

export default clerkMiddleware((auth, request) => {
  if(isProtectedRoute(request)) {
    auth().protect();
  }
  
  return NextResponse.next();
});
```
