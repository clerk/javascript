---
title: '`frontendApi` -> `publishableKey` as param to createClerkClient'
matcher: "(?:createClerkClient|Clerk)\\(\\s*{[\\s\\S]*?frontendApi:[\\s\\S]*?\\)"
matcherFlags: 'm'
category: 'deprecation-removal'
---

The `frontendApi` argument passed to `createClerkClient` must be changed to `publishableKey`. Note that the values of the two keys are different, so both keys and values need to be changed. You can find your application's publishable key in the Clerk dashboard. Also note that the import value has changed for creating a new Clerk client, which will be addressed by a separate line item if relevant to your codebase.

```diff
- import { Clerk } from '@clerk/backend';
+ import { createClerkClient } from '@clerk/backend';

- const clerkClient = Clerk({ frontendApi: '...' });
+ const clerkClient = createClerkClient({ publishableKey: '...' });

- clerkClient.authenticateRequest({ frontendApi: '...' });
+ clerkClient.authenticateRequest({ publishableKey: '...' });
```
