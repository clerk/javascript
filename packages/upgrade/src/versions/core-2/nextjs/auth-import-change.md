---
title: '`auth` import moved under `/server`'
matcher: "import\\s+{[^}]*?[,\\s]auth[,\\s][\\s\\S]*?from\\s+['\"]@clerk\\/(nextjs)(?!\/server)[\\s\\S]*?['\"]"
matcherFlags: 'm'
category: 'top-level-imports'
replaceWithString: 'nextjs/server'
---

The `auth` import path has changed from `@clerk/nextjs` to `@clerk/nextjs/server`, as this is a helper that should be only used on the server side. You must update your import path in order for it to work correctly. Example below of the fix that needs to be made:

```diff
- import { auth } from "@clerk/nextjs"
+ import { auth } from "@clerk/nextjs/server"
```
