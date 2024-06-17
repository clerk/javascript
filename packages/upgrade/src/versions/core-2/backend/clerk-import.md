---
title: '`Clerk` -> `createClerkClient`'
matcher: "import\\s+{[^}]*?Clerk[\\s\\S]*?}\\s+from\\s+['\"]@clerk/backend['\"]"
matcherFlags: 'm'
---

The top level `Clerk` import was renamed to `createClerkClient`. This is just a name change and can be treated as a text replacement, no changes to the params or return types.

```js
// before
import { Clerk } from '@clerk/backend';

// after
import { createClerkClient } from '@clerk/backend';
```
