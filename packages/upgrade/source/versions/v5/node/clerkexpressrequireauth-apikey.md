---
title: '`apiKey` -> `secretKey` as param to ClerkExpressRequireAuth'
matcher: "ClerkExpressRequireAuth\\([\\s\\S]*?apiKey:[\\s\\S]*?\\)"
category: 'deprecation-removal'
matcherFlags: 'm'
---

The `apiKey` argument passed to `ClerkExpressRequireAuth` must be changed to `secretKey`.

```diff
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

- ClerkExpressRequireAuth({ apiKey: '...' });
+ ClerkExpressRequireAuth({ secretKey: '...' });
```
