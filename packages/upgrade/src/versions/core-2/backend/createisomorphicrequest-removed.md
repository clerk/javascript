---
title: '`createIsomorphicRequest` import moved to `/internal`'
matcher: "import\\s+{[^}]*?createIsomorphicRequest[\\s\\S]*?}\\s+from\\s+['\"]@clerk\/(backend)(?!\/internal)['\"]"
replaceWithString: 'backend/internal'
matcherFlags: 'm'
category: 'import-paths'
---

The `createIsomorphicRequest` import was intended for those building custom Clerk integrations for frameworks and has been moved to `@clerk/backend/internal` to reflect this. Please use caution when using internal imports as they are outside the bounds of semver.

```diff
- import { createIsomorphicRequest } from "@clerk/backend"
+ import { createIsomorphicRequest } from "@clerk/backend/internal"
```
