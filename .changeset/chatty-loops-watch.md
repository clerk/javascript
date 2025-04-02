---
'@clerk/nuxt': minor
---

Deprecate `event.context.auth` in favor of `event.context.auth()` as function

```diff
export default clerkMiddleware((event) => {
+ const { userId } = event.context.auth()
- const { userId } = event.context.auth
  const isAdminRoute = event.path.startsWith('/api/admin')

  if (!userId && isAdminRoute) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: User not signed in',
    })
  }
})
```
