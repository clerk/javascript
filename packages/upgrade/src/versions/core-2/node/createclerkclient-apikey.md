---
title: '`apiKey` -> `secretKey` as param to createClerkClient'
matcher: "createClerkClient\\([\\s\\S]*?apiKey:[\\s\\S]*?\\)"
category: 'deprecation-removal'
matcherFlags: 'm'
---

The `apiKey` argument passed to `createClerkClient` must be changed to `secretKey`.

```diff
import { createClerkClient } from '@clerk/clerk-sdk-node';

- createClerkClient({ apiKey: '...' });
+ createClerkClient({ secretKey: '...' });
```
