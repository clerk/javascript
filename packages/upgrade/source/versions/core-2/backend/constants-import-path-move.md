---
title: '`constants` import moved to `@clerk/backend/internal`'
matcher: "import\\s+{[^}]*?constants[\\s\\S]*?}\\s+from\\s+['\"]@clerk\\/(backend)(?!\/internal)['\"]"
matcherFlags: 'm'
replaceWithString: 'backend/internal'
category: 'import-paths'
---

The `constants` import path has changed from `@clerk/backend` to `@clerk/backend/internal`. You must update your import path in order for it to work correctly. Note that internal imports are not intended for usage and are outside the scope of semver. Example below of the fix that needs to be made:

```diff
- import { constants } from "@clerk/backend"
+ import { constants } from "@clerk/backend/internal"
```
