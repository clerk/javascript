---
title: '`frontendApi` -> `publishableKey` as param to createClerkExpressRequireAuth'
matcher: "createClerkExpressRequireAuth\\([\\s\\S]*?frontendApi:[\\s\\S]*?\\)"
category: 'deprecation-removal'
matcherFlags: 'm'
---

The `frontendApi` argument passed to `createClerkExpressRequireAuth` must be changed to `publishableKey`. Note that the values of the two keys are different, so both keys and values need to be changed. You can find your application's publishable key in the Clerk dashboard.

```diff
import { createClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

- createClerkExpressRequireAuth({ frontendApi: '...' });
+ createClerkExpressRequireAuth({ publishableKey: '...' });
```
