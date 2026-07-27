---
'@clerk/nuxt': major
---

Remove `createRouteMatcher` from `@clerk/nuxt/server` and the auto-imported client-side `createRouteMatcher`. Middleware-based auth checks rely on path matching, which can diverge from how requests are actually routed and leave protected resources reachable. Move auth checks into the resources themselves.

Protect API routes inside the event handler itself:

```ts
export default defineEventHandler(event => {
  const { userId } = event.context.auth();

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  return { userId };
});
```

Protect pages with a named route middleware and opt pages into it with `definePageMeta()`. Child routes inherit the middleware applied to their parent, so a single declaration can protect a whole section:

```ts
// app/middleware/auth.ts
export default defineNuxtRouteMiddleware(() => {
  const { isSignedIn } = useAuth();

  if (!isSignedIn.value) {
    return navigateTo('/sign-in');
  }
});
```

```vue
<script setup>
definePageMeta({ middleware: 'auth' });
</script>
```

If you want to hand this work to a coding agent, use this migration prompt:

```md
Migrate my Nuxt project away from Clerk's removed `createRouteMatcher` API.

1. Find every matcher created with `createRouteMatcher`, along with the logic
   that uses it (throwing 401 errors, calling `navigateTo('/sign-in')`, etc.).
   Matchers can appear in Nitro server middleware (imported from
   `@clerk/nuxt/server`) or in Nuxt route middleware (auto-imported).
2. For every API route those matchers protected, move the auth check into the
   event handler itself:
   const { userId } = event.context.auth();
   if (!userId) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
   Keep any role or permission checks (`event.context.auth().has(...)`) with
   the resource as well.
3. For every page those matchers protected, create a named route middleware in
   `app/middleware/` that checks `useAuth()` and redirects with `navigateTo()`,
   then opt pages into it with `definePageMeta({ middleware: 'auth' })`. Child
   routes inherit the middleware applied to their parent.
4. Remove the `createRouteMatcher` imports and calls. Keep `clerkMiddleware()`
   itself. Middleware logic unrelated to auth protection (headers, locale
   redirects, etc.) may stay, using plain `getRequestURL(event).pathname`
   checks.
5. Make sure every route previously covered by a matcher pattern (including
   glob patterns like `/dashboard(.*)`) now has its own check, then verify the
   project builds.
```
