---
title: '`isClerkAPIResponseError` import moved under `/errors`'
matcher: "import\\s+{[^}]*?isClerkAPIResponseError[\\s\\S]*?from\\s+['\"]@clerk\\/(nextjs)(?!\/errors)[\\s\\S]*?['\"]"
matcherFlags: 'm'
category: 'top-level-imports'
replaceWithString: 'nextjs/errors'
---

The `isClerkAPIResponseError` import path has changed from `@clerk/nextjs` to `@clerk/nextjs/errors`. You must update your import path in order for it to work correctly. Example below of the fix that needs to be made:

```diff
- import { isClerkAPIResponseError } from "@clerk/nextjs"
+ import { isClerkAPIResponseError } from "@clerk/nextjs/errors"
```
