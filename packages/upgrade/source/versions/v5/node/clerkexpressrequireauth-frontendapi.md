---
title: '`frontendApi` -> `publishableKey` as param to ClerkExpressRequireAuth'
matcher: "ClerkExpressRequireAuth\\({.*?frontendApi:.*?}\\)"
matcherFlags: 'm'
---

The `frontendApi` argument passed to `ClerkExpressRequireAuth` must be changed to `publishableKey`. Note that the values of the two keys are different, so both keys and values need to be changed. You can find your application's publishable key in the Clerk dashboard.

```js
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// before
ClerkExpressRequireAuth({ frontendApi: '...' });

// after
ClerkExpressRequireAuth({ publishableKey: '...' });
```
