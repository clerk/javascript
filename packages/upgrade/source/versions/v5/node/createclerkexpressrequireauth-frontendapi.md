---
title: '`frontendApi` -> `publishableKey` as param to createClerkExpressRequireAuth'
matcher: "createClerkExpressRequireAuth\\({.*?frontendApi:.*?}\\)"
matcherFlags: 'm'
---

The `frontendApi` argument passed to `createClerkExpressRequireAuth` must be changed to `publishableKey`. Note that the values of the two keys are different, so both keys and values need to be changed. You can find your application's publishable key in the Clerk dashboard.

```js
import { createClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// before
createClerkExpressRequireAuth({ frontendApi: '...' });

// after
createClerkExpressRequireAuth({ publishableKey: '...' });
```
