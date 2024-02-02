---
title: '`isMetamaskError` import moved under `/errors`'
matcher: "import\\s+{[\\s\\S]*?isMetamaskError[\\s\\S]*?from\\s+['\"]@clerk\\/(nextjs)[\\s\\S]*?['\"]"
matcherFlags: 'm'
category: 'top-level-imports'
replaceWithString: 'nextjs/errors'
---

The `isMetamaskError` import path has changed from `@clerk/nextjs` to `@clerk/nextjs/errors`. You must update your import path in order for it to work correctly. Example below of the fix that needs to be made:

```diff
- import { isMetamaskError } from "@clerk/nextjs"
+ import { isMetamaskError } from "@clerk/nextjs/errors"
```
