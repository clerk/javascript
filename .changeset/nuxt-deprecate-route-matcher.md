---
'@clerk/nuxt': patch
---

Deprecate `createRouteMatcher()` in favor of Nuxt's native route matching.

To protect API routes, match paths natively inside `clerkMiddleware()`:

```ts
export default clerkMiddleware(event => {
  const { isAuthenticated } = event.context.auth();
  const { pathname } = getRequestURL(event);

  if (!isAuthenticated && pathname.startsWith('/api/admin')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
});
```

To protect pages, use Nuxt's built-in route middleware with `definePageMeta({ middleware: 'auth' })`.
