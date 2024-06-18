---
title: '`TokenVerificationError` import moved to `@clerk/backend/errors`'
matcher: "import\\s+{[^}]*?TokenVerificationError[\\s\\S]*?}\\s+from\\s+['\"]@clerk\\/(backend)(?!\/errors)['\"]"
matcherFlags: 'm'
replaceWithString: 'backend/errors'
category: 'import-paths'
---

The `TokenVerificationError` import path has changed from `@clerk/backend` to `@clerk/backend/errors`. You must update your import path in order for it to work correctly. Example below of the fix that needs to be made:

```diff
- import { TokenVerificationError } from "@clerk/backend"
+ import { TokenVerificationError } from "@clerk/backend/errors"
```
