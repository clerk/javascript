---
title: '`signJwt` import moved to `@clerk/backend/tokens`'
matcher: "import\\s+{[^}]*?signJwt[\\s\\S]*?}\\s+from\\s+['\"]@clerk\\/(backend)(?!\/tokens)['\"]"
matcherFlags: 'm'
replaceWithString: 'backend/tokens'
category: 'import-paths'
---

The `signJwt` import path has changed from `@clerk/backend` to `@clerk/backend/tokens`. You must update your import path in order for it to work correctly. Example below of the fix that needs to be made

```diff
- import { signJwt } from "@clerk/backend"
+ import { signJwt } from "@clerk/backend/tokens"
```
