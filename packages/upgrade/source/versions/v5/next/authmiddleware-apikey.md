---
title: '`apiKey` -> `secretKey` as param to authMiddleware'
matcher: "authMiddleware\\({[\\s\\S]*?apiKey:[\\s\\S]*?}\\)"
matcherFlags: 'm'
---

The `apiKey` argument passed to `authMiddleware` must be changed to `secretKey`.

```js
import { authMiddleware } from '@clerk/nextjs';

// before
authMiddleware({ apiKey: '...' });

// after
authMiddleware({ secretKey: '...' });
```
