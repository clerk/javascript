---
title: '`verifyJwt` import moved to `@clerk/backend/tokens`'
matcher: "import\\s+{[^}]*?verifyJwt[\\s\\S]*?}\\s+from\\s+['\"]@clerk\\/(backend)(?!\/tokens)['\"]"
matcherFlags: 'm'
replaceWithString: 'backend/tokens'
category: 'import-paths'
---

The `verifyJwt` import path has changed from `@clerk/backend` to `@clerk/backend/tokens`. You must update your import path in order for it to work correctly. Example below of the fix that needs to be made

```diff
- import { verifyJwt } from "@clerk/backend"
+ import { verifyJwt } from "@clerk/backend/tokens"
```
