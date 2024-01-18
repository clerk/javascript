---
title: '`buildRequestUrl` import moved to `/internal`'
matcher: "import\\s+{[\\s\\S]*?buildRequestUrl[\\s\\S]*?}\\s+from\\s+['\"]@clerk\/(backend)['\"]"
replaceWithString: 'backend/internal'
matcherFlags: 'm'
---

The `buildRequestUrl` import was intended for those building custom Clerk integrations for frameworks and has been moved to `@clerk/backend/internal` to reflect this. Please use caution when using internal imports as they are outside the bounds of semver.

```diff
- import { buildRequestUrl } from "@clerk/backend"
+ import { buildRequestUrl } from "@clerk/backend/internal"
```
