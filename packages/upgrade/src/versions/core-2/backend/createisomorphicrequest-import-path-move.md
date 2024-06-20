---
title: '`createIsomorphicRequest` import moved to `@clerk/backend/internal`'
matcher: "import\\s+{[^}]*?createIsomorphicRequest[\\s\\S]*?}\\s+from\\s+['\"]@clerk\\/(backend)(?!\/internal)['\"]"
matcherFlags: 'm'
replaceWithString: 'backend/internal'
category: 'import-paths'
---

The `createIsomorphicRequest` import path has changed from `@clerk/backend` to `@clerk/backend/internal`. You must update your import path in order for it to work correctly. Note that internal imports are not intended for usage and are outside the scope of semver. Example below of the fix that needs to be made:

```diff
- import { createIsomorphicRequest } from "@clerk/backend"
+ import { createIsomorphicRequest } from "@clerk/backend/internal"
```
