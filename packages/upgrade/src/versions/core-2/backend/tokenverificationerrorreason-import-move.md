---
title: '`TokenVerificationErrorReason` import moved to `@clerk/backend/errors`'
matcher: "import\\s+{[^}]*?TokenVerificationErrorReason[\\s\\S]*?}\\s+from\\s+['\"]@clerk\\/(backend)(?!\/errors)['\"]"
matcherFlags: 'm'
replaceWithString: 'backend/errors'
category: 'import-paths'
---

The `TokenVerificationErrorReason` import path has changed from `@clerk/backend` to `@clerk/backend/errors`. You must update your import path in order for it to work correctly. Example below of the fix that needs to be made:

```diff
- import { TokenVerificationErrorReason } from "@clerk/backend"
+ import { TokenVerificationErrorReason } from "@clerk/backend/errors"
```
