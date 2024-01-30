---
title: '`frontendApi` -> `publishableKey` as param to clerkPlugin'
matcher: "fastify\\.register\\(clerkPlugin,.*?{.*?frontendApi:.*?}\\)"
matcherFlags: 'm'
---

The `frontendApi` argument passed to `clerkPlugin` must be changed to `publishableKey`. Note that the values of the two keys are different, so both keys and values need to be changed. You can find your application's publishable key in the Clerk dashboard.

```diff
import { clerkPlugin } from '@clerk/fastify';

- fastify.register(clerkPlugin, { frontendApi: '...' });
+ fastify.register(clerkPlugin, { publishableKey: '...' });
```
