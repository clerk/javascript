---
title: '`createAuthenticateRequest` import moved to `@clerk/backend/internal`'
matcher: "import\\s+{[^}]*?createAuthenticateRequest[\\s\\S]*?}\\s+from\\s+['\"]@clerk\\/(backend)['\"]"
matcherFlags: 'm'
replaceWithString: 'backend/internal'
category: 'import-paths'
---

The `createAuthenticateRequest` import path has changed from `@clerk/backend` to `@clerk/backend/internal`. You must update your import path in order for it to work correctly. Note that internal imports are not intended for usage and are outside the scope of semver. Example below of the fix that needs to be made:

```diff
- import { createAuthenticateRequest } from "@clerk/backend"
+ import { createAuthenticateRequest } from "@clerk/backend/internal"
```
