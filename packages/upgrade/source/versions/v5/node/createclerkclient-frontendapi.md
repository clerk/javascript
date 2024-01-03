---
title: '`frontendApi` -> `publishableKey` as param to createClerkClient'
matcher: "createClerkClient\\({.*?frontendApi:.*?}\\)"
matcherFlags: 'm'
---

The `frontendApi` argument passed to `createClerkClient` must be changed to `publishableKey`. Note that the values of the two keys are different, so both keys and values need to be changed. You can find your application's publishable key in the Clerk dashboard.

```js
import { createClerkClient } from '@clerk/clerk-sdk-node';

// before
createClerkClient({ frontendApi: '...' });

// after
createClerkClient({ publishableKey: '...' });
```
