---
'@clerk/astro': patch
---

Deprecate `createRouteMatcher()` in favor of resource-based auth checks.

Instead of protecting routes only from middleware, move auth checks into each protected Astro page, API route, or server-side handler:

```ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ locals }) => {
  const { userId } = locals.auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json({ userId });
};
```
