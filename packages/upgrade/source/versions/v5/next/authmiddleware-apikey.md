---
title: '`apiKey` -> `secretKey` as param to `authMiddleware`'
matcher: "authMiddleware\\({[\\s\\S]*?apiKey:[\\s\\S]*?}\\)"
category: 'deprecation-removal'
matcherFlags: 'm'
---

The `apiKey` argument passed to `authMiddleware` must be changed to `secretKey`.

```diff
import { authMiddleware } from '@clerk/nextjs';

- authMiddleware({ apiKey: '...' });
+ authMiddleware({ secretKey: '...' });
```
