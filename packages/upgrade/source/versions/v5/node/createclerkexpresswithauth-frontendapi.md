---
title: '`frontendApi` -> `publishableKey` as param to createClerkExpressWithAuth'
matcher: "createClerkExpressWithAuth\\({.*?frontendApi:.*?}\\)"
matcherFlags: 'm'
---

The `frontendApi` argument passed to `createClerkExpressWithAuth` must be changed to `publishableKey`. Note that the values of the two keys are different, so both keys and values need to be changed. You can find your application's publishable key in the Clerk dashboard.

```js
import { createClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

// before
createClerkExpressWithAuth({ frontendApi: '...' });

// after
createClerkExpressWithAuth({ publishableKey: '...' });
```
