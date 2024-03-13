---
title: '`MultiSessionAppSupport` import moved under `/internal`'
matcher: "import\\s+{[^}]*?MultiSessionAppSupport[\\s\\S]*?from\\s+['\"]@clerk\\/(nextjs)(?!\/internal)[\\s\\S]*?['\"]"
category: 'deprecation-removal'
matcherFlags: 'm'
replaceWithString: 'nextjs/internal'
---

The `MultiSessionAppSupport` import path has changed from `@clerk/nextjs` to `@clerk/nextjs/internal`. You must update your import path in order for it to work correctly. Note that internal imports are not intended for usage and are outside the scope of semver. Example below of the fix that needs to be made:

```diff
- import { MultiSessionAppSupport } from "@clerk/nextjs"
+ import { MultiSessionAppSupport } from "@clerk/nextjs/internal"
```
