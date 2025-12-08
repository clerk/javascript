---
title: 'Encryption key required when passing `secretKey` at runtime'
packages: ['nextjs']
matcher: 'clerkMiddleware[\\s\\S]*?secretKey'
matcherFlags: 'm'
category: 'breaking'
---

When passing `secretKey` as a runtime option to `clerkMiddleware()`, you must now also provide a `CLERK_ENCRYPTION_KEY` environment variable.

Add the encryption key to your environment:

```env
CLERK_ENCRYPTION_KEY=your-encryption-key
```

More information: https://clerk.com/docs/reference/nextjs/clerk-middleware#dynamic-keys
