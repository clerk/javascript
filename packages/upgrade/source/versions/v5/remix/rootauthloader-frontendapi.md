---
title: '`frontendApi` -> `publishableKey` as argument to rootAuthLoader'
matcher: "rootAuthLoader\\({[\\s\\S]*?frontendApi:[\\s\\S]*?}\\)"
matcherFlags: 'm'
---

The `frontendApi` argument passed to `rootAuthLoader` must be changed to `publishableKey`.

```diff
import { rootAuthLoader } from '@clerk/remix/ssr.server';

- export const loader = args => rootAuthLoader(args, { frontendApi: '...' });
+ export const loader = args => rootAuthLoader(args, { publishableKey: '...' });
```
