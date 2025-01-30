---
'@clerk/nuxt': minor
---

Add `createRouteMatcher()`, a helper function that allows you to protect multiple pages or API routes.

For protecting pages (in a global route middleware):

```ts
// createRouteMatcher is automatically imported
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/forum(.*)'])

export default defineNuxtRouteMiddleware(to => {
  const { userId } = useAuth();

  if (userId.value && isProtectedRoute(to)) {
    return navigateTo('/sign-in');
  }
});
```

For protecting API routes:

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nuxt/server';

// Unlike pages, you need to import `createRouteMatcher` from `@clerk/nuxt/server`
const isProtectedRoute = createRouteMatcher(['/api/user(.*)', '/api/projects(.*)']);

export default clerkMiddleware((event) => {
    const { userId } = event.context.auth

    if (!userId && isProtectedRoute(event)) {
        setResponseStatus(event, 401)
        return 'You are not authorized to access this resource.'
    }
});
```