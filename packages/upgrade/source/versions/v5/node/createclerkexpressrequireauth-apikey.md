---
title: '`apiKey` -> `secretKey` as param to createClerkExpressRequireAuth'
matcher: "createClerkExpressRequireAuth\\({.*?apiKey:.*?}\\)"
matcherFlags: 'm'
---

The `apiKey` argument passed to `createClerkExpressRequireAuth` must be changed to `secretKey`.

```js
import { createClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// before
createClerkExpressRequireAuth({ apiKey: '...' });

// after
createClerkExpressRequireAuth({ secretKey: '...' });
```
