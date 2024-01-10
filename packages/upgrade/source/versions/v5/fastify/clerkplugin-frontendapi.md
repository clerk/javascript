---
title: '`frontendApi` -> `publishableKey` as param to clerkPlugin'
matcher: "fastify\\.register\\(clerkPlugin,.*?{.*?frontendApi:.*?}\\)"
matcherFlags: 'm'
---

The `frontendApi` argument passed to `clerkPlugin` must be changed to `publishableKey`. Note that the values of the two keys are different, so both keys and values need to be changed. You can find your application's publishable key in the Clerk dashboard.

```js
import { clerkPlugin } from '@clerk/fastify';

// before
fastify.register(clerkPlugin, { frontendApi: '...' });

// after
fastify.register(clerkPlugin, { publishableKey: '...' });
```
