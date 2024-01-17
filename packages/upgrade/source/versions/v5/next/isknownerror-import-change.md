---
title: '`isKnownError` import moved under `/errors`'
matcher: "import\\s+{[\\s\\S]*?isKnownError[\\s\\S]*?from\\s+['\"]@clerk\\/(nextjs)[\\s\\S]*?['\"]"
replaceWithString: 'nextjs/errors'
---

The `isKnownError` import path has changed from `@clerk/nextjs` to `@clerk/nextjs/errors`. You must update your import path in order for it to work correctly. Example below of the fix that needs to be made:

```diff
- import { isKnownError } from "@clerk/nextjs"
+ import { isKnownError } from "@clerk/nextjs/errors"
```
