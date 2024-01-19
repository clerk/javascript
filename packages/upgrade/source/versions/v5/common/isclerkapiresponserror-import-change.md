---
title: '`isClerkAPIResponseError` import moved under `/errors`'
matcher: "import\\s+{[\\s\\S]*?isClerkAPIResponseError[\\s\\S]*?from\\s+['\"]@clerk\\/(clerk-react)[\\s\\S]*?['\"]"
matcherFlags: 'm'
replaceWithString: 'clerk-react/errors'
---

The `isClerkAPIResponseError` import path has changed from `@clerk/clerk-react` to `@clerk/clerk-react/errors`. You must update your import path in order for it to work correctly. Example below of the fix that needs to be made:

```diff
- import { isClerkAPIResponseError } from "@clerk/clerk-react"
+ import { isClerkAPIResponseError } from "@clerk/clerk-react/errors"
```
