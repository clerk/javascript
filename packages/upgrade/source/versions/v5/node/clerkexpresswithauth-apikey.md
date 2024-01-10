---
title: '`apiKey` -> `secretKey` as param to ClerkExpressWithAuth'
matcher: "ClerkExpressWithAuth\\({.*?apiKey:.*?}\\)"
matcherFlags: 'm'
---

The `apiKey` argument passed to `ClerkExpressWithAuth` must be changed to `secretKey`.

```js
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

// before
ClerkExpressWithAuth({ apiKey: '...' });

// after
ClerkExpressWithAuth({ secretKey: '...' });
```
