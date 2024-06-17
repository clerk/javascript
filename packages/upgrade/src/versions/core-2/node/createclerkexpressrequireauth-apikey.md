---
title: '`apiKey` -> `secretKey` as param to createClerkExpressRequireAuth'
matcher: "createClerkExpressRequireAuth\\([\\s\\S]*?apiKey:[\\s\\S]*?\\)"
category: 'deprecation-removal'
matcherFlags: 'm'
---

The `apiKey` argument passed to `createClerkExpressRequireAuth` must be changed to `secretKey`.

```diff
import { createClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

- createClerkExpressRequireAuth({ apiKey: '...' });
+ createClerkExpressRequireAuth({ secretKey: '...' });
```
