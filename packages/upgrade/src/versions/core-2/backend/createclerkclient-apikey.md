---
title: '`apiKey` -> `secretKey` as param to createClerkClient'
matcher: "(?:createClerkClient|Clerk)\\(\\s*{[\\s\\S]*?frontendApi:[\\s\\S]*?\\)"
category: 'deprecation-removal'
matcherFlags: 'm'
---

The `apiKey` argument passed to `createClerkClient` must be changed to `secretKey`. Also note that the import value has changed for creating a new Clerk client, which will be addressed by a separate line item if relevant to your codebase.

```diff
- import { Clerk } from '@clerk/backend';
+ import { createClerkClient } from '@clerk/backend';

- const clerkClient = Clerk({ apiKey: '...' });
+ const clerkClient = createClerkClient({ secretKey: '...' });

- clerkClient.authenticateRequest({ apiKey: '...' });
+ clerkClient.authenticateRequest({ secretKey: '...' });
```
