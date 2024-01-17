---
title: '`buildClerkProps` import moved under `/server`'
matcher: "import\\s+{[\\s\\S]*?buildClerkProps[\\s\\S]*?from\\s+['\"]@clerk\\/(nextjs)[\\s\\S]*?['\"]"
replaceWithString: 'nextjs/server'
---

The `buildClerkProps` import path has changed from `@clerk/nextjs` to `@clerk/nextjs/server`, as this is a helper that should be only used on the server side. You must update your import path in order for it to work correctly. Example below of the fix that needs to be made:

```diff
- import { buildClerkProps } from "@clerk/nextjs"
+ import { buildClerkProps } from "@clerk/nextjs/server"
```
