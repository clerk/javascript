---
title: '`frontendApi` -> `publishableKey` as param to ClerkExpressWithAuth'
matcher: "ClerkExpressWithAuth\\({.*?frontendApi:.*?}\\)"
matcherFlags: 'm'
---

The `frontendApi` argument passed to `ClerkExpressWithAuth` must be changed to `publishableKey`. Note that the values of the two keys are different, so both keys and values need to be changed. You can find your application's publishable key in the Clerk dashboard.

```js
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

// before
ClerkExpressWithAuth({ frontendApi: '...' });

// after
ClerkExpressWithAuth({ publishableKey: '...' });
```
