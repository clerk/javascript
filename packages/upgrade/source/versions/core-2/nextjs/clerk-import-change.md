---
title: '`Clerk` import moved under `/server`'
matcher: "import\\s+{[^}]*?[,\\s]Clerk[,\\s][\\s\\S]*?from\\s+['\"]@clerk\\/nextjs(?!\/server)[\\s\\S]*?['\"]"
category: 'top-level-imports'
matcherFlags: 'm'
---

The `Clerk` import path has changed from `@clerk/nextjs` to `@clerk/nextjs/server`, as this is a helper that should be only used on the server side. You must update your import path in order for it to work correctly. Note as well that the `Clerk` export has changed to `createClerkClient` as part of the v5 changes. Example below of the fix that needs to be made:

```diff
- import { Clerk } from "@clerk/nextjs"
+ import { createClerkClient } from "@clerk/nextjs/server"
```
