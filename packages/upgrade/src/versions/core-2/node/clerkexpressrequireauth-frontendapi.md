---
title: '`frontendApi` -> `publishableKey` as param to ClerkExpressRequireAuth'
matcher: "ClerkExpressRequireAuth\\([\\s\\S]*?frontendApi:[\\s\\S]*?\\)"
category: 'deprecation-removal'
matcherFlags: 'm'
---

The `frontendApi` argument passed to `ClerkExpressRequireAuth` must be changed to `publishableKey`. Note that the values of the two keys are different, so both keys and values need to be changed. You can find your application's publishable key in the Clerk dashboard.

```diff
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

- ClerkExpressRequireAuth({ frontendApi: '...' });
+ ClerkExpressRequireAuth({ publishableKey: '...' });
```
