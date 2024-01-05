---
title: '`Clerk` -> `createClerkClient`'
matcher: "import\\s+{[\\s\\S]*?Clerk[\\s\\S]*?}\\s+from\\s+['\"]@clerk/backend['\"]"
matcherFlags: 'm'
---

The `Clerk` top level import has been replaced by `createClerkClient` to make it more clear how it functions. This is just a name change and can be treated as a text replacement, no changes to the params or return types.

```js
// before
import { Clerk } from '@clerk/backend';

// after
import { createClerkClient } from '@clerk/backend';
```
