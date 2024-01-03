---
title: '`apiKey` -> `secretKey` as param to ClerkExpressRequireAuth'
matcher: "ClerkExpressRequireAuth\\({.*?apiKey:.*?}\\)"
matcherFlags: 'm'
---

The `apiKey` argument passed to `ClerkExpressRequireAuth` must be changed to `secretKey`.

```js
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// before
ClerkExpressRequireAuth({ apiKey: '...' });

// after
ClerkExpressRequireAuth({ secretKey: '...' });
```
