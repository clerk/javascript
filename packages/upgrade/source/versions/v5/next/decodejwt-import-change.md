---
title: '`decodeJwt` import moved under `/server`'
matcher: "import\\s+{[\\s\\S]*?decodeJwt[\\s\\S]*?from\\s+['\"]@clerk\\/(nextjs)[\\s\\S]*?['\"]"
matcherFlags: 'm'
replaceWithString: 'nextjs/server'
---

The `decodeJwt` import path has changed from `@clerk/nextjs` to `@clerk/nextjs/server`, as this is a helper that should be only used on the server side. You must update your import path in order for it to work correctly. Example below of the fix that needs to be made:

```diff
- import { decodeJwt } from "@clerk/nextjs"
+ import { decodeJwt } from "@clerk/nextjs/server"
```
