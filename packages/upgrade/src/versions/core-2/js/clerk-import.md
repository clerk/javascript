---
title: '`Clerk` import changed'
matcher: "import\\s+{[^}]*?(Clerk)[\\s\\S]*?}\\s+from\\s+['\"]@clerk/clerk-js(?:\/headless)?['\"]"
matcherFlags: 'm'
replaceWithString: '{ Clerk }'
---

The top level `Clerk` import was changed to a named export, like `{ Clerk }`. This is just a name change and can be treated as a text replacement, no changes to the params or return types.

```diff
- import Clerk from '@clerk/clerk-js';
+ import { Clerk } from '@clerk/clerk-js';
```
