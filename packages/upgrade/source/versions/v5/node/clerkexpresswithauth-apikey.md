---
title: '`apiKey` -> `secretKey` as param to ClerkExpressWithAuth'
matcher: "ClerkExpressWithAuth\\([\\s\\S]*?apiKey:[\\s\\S]*?\\)"
matcherFlags: 'm'
---

The `apiKey` argument passed to `ClerkExpressWithAuth` must be changed to `secretKey`.

```diff
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

- ClerkExpressWithAuth({ apiKey: '...' });
+ ClerkExpressWithAuth({ secretKey: '...' });
```
