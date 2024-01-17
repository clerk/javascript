---
title: '`constants` import moved under `/server`'
matcher: "import\\s+{[\\s\\S]*?constants[\\s\\S]*?from\\s+['\"]@clerk\\/(nextjs)[\\s\\S]*?['\"]"
replaceWithString: 'nextjs/server'
---

The `constants` import path has changed from `@clerk/nextjs` to `@clerk/nextjs/server`, as this is a helper that should be only used on the server side. You must update your import path in order for it to work correctly. Example below of the fix that needs to be made:

```diff
- import { constants } from "@clerk/nextjs"
+ import { constants } from "@clerk/nextjs/server"
```
