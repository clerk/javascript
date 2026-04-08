---
'@clerk/express': minor
---

Deprecated `requireAuth()` middleware. It will be removed in the next major version.

The `requireAuth()` middleware redirects unauthenticated requests to a sign-in page, which is often unexpected for API routes where a 401 response is more appropriate. Use `clerkMiddleware()` with `getAuth()` instead for explicit control over authentication behavior.

**Before (deprecated):**

```js
import { requireAuth } from '@clerk/express';

app.get('/api/protected', requireAuth(), (req, res) => {
  // handle authenticated request
});
```

**After (recommended):**

```js
import { clerkMiddleware, getAuth } from '@clerk/express';

app.use(clerkMiddleware());

app.get('/api/protected', (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // handle authenticated request
});
```
