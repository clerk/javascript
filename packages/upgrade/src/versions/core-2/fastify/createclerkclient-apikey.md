---
title: '`apiKey` -> `secretKey` as param to createClerkClient'
matcher: "createClerkClient\\([\\s\\S]*?apiKey:[\\s\\S]*?\\)"
matcherFlags: 'm'
category: 'deprecation-removal'
---

The `apiKey` argument passed to `createClerkClient` must be changed to `secretKey`.

```diff
import { createClerkClient } from '@clerk/fastify';

- createClerkClient({ apiKey: '...' });
+ createClerkClient({ secretKey: '...' });
```
