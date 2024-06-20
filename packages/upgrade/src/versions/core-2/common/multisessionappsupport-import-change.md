---
title: '`MultisessionAppSupport` import moved to `/internal`'
matcher: "import\\s+{[^}]*?MutliSessionAppSupport[\\s\\S]*?from\\s+['\"]@clerk\\/clerk-react(?!\/internal)[\\s\\S]*?['\"]"
matcherFlags: 'm'
---

`MultiSessionAppSupport` is a component that handles the intermediate “undefined” state for multisession apps by unmounting and remounting the components during the session switch (`setActive` call) in order to solve theoretical edge-cases that can arise while switching sessions. It is undocumented and intended only for internal use, so it has been moved to an `/internal` import path. Please note that internal imports are not intended for public use, and are outside the scope of semver.

```diff
- import { MultiSessionAppSupport } from '@clerk/clerk-react'
+ import { MultiSessionAppSupport } from '@clerk/clerk-react/internal'
```
