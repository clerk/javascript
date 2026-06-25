---
'@clerk/nextjs': patch
---

Deprecate `createRouteMatcher()` in favor of resource-based auth checks.

Middleware-based auth checks rely on path matching, which can diverge from how Next.js routes requests and leave protected resources reachable.

For a migration guide, see:
  https://clerk.com/docs/guides/development/upgrading/upgrade-guides/migrating-from-create-route-matcher

Instead of protecting routes from middleware, move auth checks into each protected page, layout, API route, or Server Function, for example:

```ts
import { auth } from '@clerk/nextjs/server'

export default async function Page() {
  await auth.protect()

  return <h1>Dashboard</h1>
}
```
