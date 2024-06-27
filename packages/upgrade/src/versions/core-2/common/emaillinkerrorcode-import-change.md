---
title: '`EmailLinkErrorCode` import moved under `/errors`'
matcher: "import\\s+{[^}]*?EmailLinkErrorCode[\\s\\S]*?from\\s+['\"]@clerk\\/(clerk-react)(?!\/errors)[\\s\\S]*?['\"]"
matcherFlags: 'm'
category: 'error-imports'
replaceWithString: 'clerk-react/errors'
---

The `EmailLinkErrorCode` import path has changed from `@clerk/clerk-react` to `@clerk/clerk-react/errors`. You must update your import path in order for it to work correctly. Example below of the fix that needs to be made:

```diff
- import { EmailLinkErrorCode } from "@clerk/clerk-react"
+ import { EmailLinkErrorCode } from "@clerk/clerk-react/errors"
```
