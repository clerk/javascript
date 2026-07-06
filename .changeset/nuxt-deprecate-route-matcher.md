---
'@clerk/nuxt': patch
---

Deprecate `createRouteMatcher()` in favor of Nuxt's native route matching.

To protect API routes, match paths natively inside `clerkMiddleware()`:

```ts
import { clerkMiddleware } from '@clerk/nuxt/server';

export default clerkMiddleware(event => {
  const { isAuthenticated } = event.context.auth();
  const { pathname } = getRequestURL(event);

  if (!isAuthenticated && pathname.startsWith('/api/admin')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
});
```

To protect pages, use Nuxt's built-in route middleware: create a named middleware that checks the user's authentication status and opt pages into it with `definePageMeta({ middleware: 'auth' })`. Child routes inherit the middleware applied to their parent, so a single declaration can protect a whole section.

```ts
// app/middleware/auth.ts
export default defineNuxtRouteMiddleware(() => {
  const { isSignedIn } = useAuth();

  if (!isSignedIn.value) {
    return navigateTo('/sign-in');
  }
});
```
