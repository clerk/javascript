---
title: '`redirectToSignUp` import moved under `/server`'
matcher: "import\\s+{[^}]*?[,\\s]redirectToSignUp[,\\s][\\s\\S]*?from\\s+['\"]@clerk\\/(nextjs)(?!\/server)[\\s\\S]*?['\"]"
category: 'top-level-imports'
replaceWithString: 'nextjs/server'
---

The `redirectToSignUp` import path has changed from `@clerk/nextjs` to `@clerk/nextjs/server`, as this is a helper that should be only used on the server side. You must update your import path in order for it to work correctly. Example below of the fix that needs to be made:

```diff
- import { redirectToSignUp } from "@clerk/nextjs"
+ import { redirectToSignUp } from "@clerk/nextjs/server"
```
