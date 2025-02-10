---
title: '`isEmailLinkError` import moved under `/errors`'
matcher: "import\\s+{[^}]*?isEmailLinkError[\\s\\S]*?from\\s+['\"]@clerk\\/(clerk-react)(?!\/errors)[\\s\\S]*?['\"]"
matcherFlags: 'm'
category: 'error-imports'
replaceWithString: 'clerk-react/errors'
---

The `isEmailLinkError` import path has changed from `@clerk/clerk-react` to `@clerk/clerk-react/errors`. You must update your import path in order for it to work correctly. Example below of the fix that needs to be made:

```diff
- import { isEmailLinkError } from "@clerk/clerk-react"
+ import { isEmailLinkError } from "@clerk/clerk-react/errors"
```
