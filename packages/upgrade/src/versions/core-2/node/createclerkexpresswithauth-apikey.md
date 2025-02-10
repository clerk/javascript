---
title: '`apiKey` -> `secretKey` as param to createClerkExpressWithAuth'
matcher: "createClerkExpressWithAuth\\([\\s\\S]*?apiKey:[\\s\\S]*?\\)"
category: 'deprecation-removal'
matcherFlags: 'm'
---

The `apiKey` argument passed to `createClerkExpressWithAuth` must be changed to `secretKey`.

```diff
import { createClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

- createClerkExpressWithAuth({ apiKey: '...' });
+ createClerkExpressWithAuth({ secretKey: '...' });
```
