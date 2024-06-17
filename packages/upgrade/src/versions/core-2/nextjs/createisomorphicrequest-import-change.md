---
title: '`createIsomorphicRequest` import moved under `/server`'
matcher: "import\\s+{[^}]*?createIsomorphicRequest[\\s\\S]*?from\\s+['\"]@clerk\\/(nextjs)(?!\/server)[\\s\\S]*?['\"]"
matcherFlags: 'm'
category: 'top-level-imports'
replaceWithString: 'nextjs/server'
---

The `createIsomorphicRequest` import path has changed from `@clerk/nextjs` to `@clerk/nextjs/server`, as this is a helper that should be only used on the server side. You must update your import path in order for it to work correctly. Example below of the fix that needs to be made:

```diff
- import { createIsomorphicRequest } from "@clerk/nextjs"
+ import { createIsomorphicRequest } from "@clerk/nextjs/server"
```
