---
title: '`apiKey` -> `secretKey` as param to createClerkExpressWithAuth'
matcher: "createClerkExpressWithAuth\\({.*?apiKey:.*?}\\)"
matcherFlags: 'm'
---

The `apiKey` argument passed to `createClerkExpressWithAuth` must be changed to `secretKey`.

```js
import { createClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

// before
createClerkExpressWithAuth({ apiKey: '...' });

// after
createClerkExpressWithAuth({ secretKey: '...' });
```
