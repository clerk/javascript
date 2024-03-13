---
title: '`decodeJwt` import moved to `@clerk/backend/tokens`'
matcher: "import\\s+{[^}]*?decodeJwt[\\s\\S]*?}\\s+from\\s+['\"]@clerk\\/(backend)(?!\/tokens)['\"]"
matcherFlags: 'm'
replaceWithString: 'backend/tokens'
category: 'import-paths'
---

The `decodeJwt` import path has changed from `@clerk/backend` to `@clerk/backend/tokens`. You must update your import path in order for it to work correctly. Example below of the fix that needs to be made

```diff
- import { decodeJwt } from "@clerk/backend"
+ import { decodeJwt } from "@clerk/backend/tokens"
```
