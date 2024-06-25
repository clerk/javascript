---
title: '`TokenVerificationErrorCode` import moved to `@clerk/backend/errors`'
matcher: "import\\s+{[^}]*?TokenVerificationErrorCode[\\s\\S]*?}\\s+from\\s+['\"]@clerk\\/(backend)(?!\/errors)['\"]"
matcherFlags: 'm'
replaceWithString: 'backend/errors'
category: 'import-paths'
---

The `TokenVerificationErrorCode` import path has changed from `@clerk/backend` to `@clerk/backend/errors`. You must update your import path in order for it to work correctly. Example below of the fix that needs to be made:

```diff
- import { TokenVerificationErrorCode } from "@clerk/backend"
+ import { TokenVerificationErrorCode } from "@clerk/backend/errors"
```
