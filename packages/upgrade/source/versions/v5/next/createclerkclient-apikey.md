---
title: '`apiKey` -> `secretKey` as param to createClerkClient'
matcher: "createClerkClient\\({.*?apiKey:.*?}\\)"
matcherFlags: 'm'
---

The `apiKey` argument passed to `createClerkClient` must be changed to `secretKey`.

```js
import { createClerkClient } from '@clerk/nextjs/server';

// before
createClerkClient({ apiKey: '...' });

// after
createClerkClient({ secretKey: '...' });
```
