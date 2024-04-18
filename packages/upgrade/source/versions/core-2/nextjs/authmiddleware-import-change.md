---
title: '`authMiddleware` import moved under `/server`'
matcher: "import\\s+{[^}]*?authMiddleware[\\s\\S]*?from\\s+['\"]@clerk\\/(nextjs)(?!\/server)[\\s\\S]*?['\"]"
matcherFlags: 'm'
category: 'top-level-imports'
replaceWithString: 'nextjs/server'
---

The `authMiddleware` import path has changed from `@clerk/nextjs` to `@clerk/nextjs/server`, as this is a helper that should be only used on the server side. You must update your import path in order for it to work correctly. Note as well that `authMiddleware` is deprecated as of this release, and we recommend [using `clerkMiddleware` instead](https://clerk.com/docs/references/nextjs/clerk-middleware). Example below of the fix that needs to be made:

```diff
- import { authMiddleware } from "@clerk/nextjs"
+ import { authMiddleware } from "@clerk/nextjs/server"
```
