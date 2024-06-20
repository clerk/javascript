---
title: '`apiKey` -> `secretKey` as argument to rootAuthLoader'
matcher: "rootAuthLoader\\({[\\s\\S]*?apiKey:[\\s\\S]*?}\\)"
category: 'deprecation-removal'
matcherFlags: 'm'
---

The `apiKey` argument passed to `rootAuthLoader` must be changed to `secretKey`.

```diff
import { rootAuthLoader } from '@clerk/remix/ssr.server';

- export const loader = args => rootAuthLoader(args, { apiKey: '...' });
+ export const loader = args => rootAuthLoader(args, { secretKey: '...' });
```
