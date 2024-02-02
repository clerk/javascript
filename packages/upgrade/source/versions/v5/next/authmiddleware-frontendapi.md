---
title: '`frontendApi` -> `publishableKey` as param to `authMiddleware`'
matcher: "authMiddleware\\({[\\s\\S]*?frontendApi:[\\s\\S]*?}\\)"
category: 'deprecation-removal'
matcherFlags: 'm'
---

The `frontendApi` argument passed to `authMiddleware` must be changed to `publishableKey`

```diff
import { authMiddleware } from "@clerk/nextjs/server"

- authMiddleware({ frontendApi: '...' })
+ authMiddleware({ publishableKey: '...' })
```
