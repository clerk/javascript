---
title: '`apiKey` -> `secretKey` as param to createClerkClient'
matcher: "createClerkClient\\([\\s\\S]*?apiKey:[\\s\\S]*?\\)"
matcherFlags: 'm'
---

The `apiKey` argument passed to `createClerkClient` must be changed to `secretKey`.

```diff
import { createClerkClient } from 'gatsby-plugin-clerk/api';

- createClerkClient({ apiKey: '...' });
+ createClerkClient({ secretKey: '...' });
```
