---
title: '`@clerk/nextjs/api` import removed'
category: 'deprecation-removal'
matcher: "@clerk\\/nextjs\\/api"
---

The import subpath `@clerk/nextjs/api` has been removed. This includes the following imports:

```js
// These have been removed
import {
  ClerkMiddleware,
  ClerkMiddlewareOptions,
  LooseAuthProp,
  RequireAuthProp,
  StrictAuthProp,
  WithAuthProp,
} from '@clerk/nextjs/api';
```

If you still need to use any of these functions, they can be instead imported from `@clerk/clerk-sdk-node`.
