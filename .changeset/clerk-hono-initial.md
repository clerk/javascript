---
'@clerk/hono': minor
---

Initial release of `@clerk/hono` - the official Clerk SDK for Hono.

This package provides:
- `clerkMiddleware()` - Middleware to authenticate requests and attach auth data to Hono context
- `getAuth(c)` - Helper to retrieve auth data from Hono context
- `verifyWebhook(c)` - Webhook verification via `@clerk/hono/webhooks`

**Usage:**

```typescript
import { Hono } from 'hono';
import { clerkMiddleware, getAuth } from '@clerk/hono';

const app = new Hono();

app.use('*', clerkMiddleware());

app.get('/protected', (c) => {
  const { userId } = getAuth(c);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  return c.json({ userId });
});
```

Based on the community `@hono/clerk-auth` package. Thank you to Vaggelis Yfantis for the original implementation!
