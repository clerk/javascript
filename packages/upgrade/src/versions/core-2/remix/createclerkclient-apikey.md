---
title: '`apiKey` -> `secretKey` as argument to createClerkClient'
matcher: "createClerkClient\\({[\\s\\S]*?apiKey:[\\s\\S]*?}\\)"
category: 'deprecation-removal'
matcherFlags: 'm'
---

The `apiKey` argument passed to `createClerkClient` must be changed to `secretKey`.

```diff
import { createClerkClient } from '@clerk/remix/api.server';

- createClerkClient({ apiKey: '...' });
+ createClerkClient({ secretKey: '...' });
```
