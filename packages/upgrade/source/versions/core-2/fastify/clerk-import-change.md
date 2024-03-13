---
title: '`Clerk` -> `{ createClerkClient }`'
matcher: "import\\s+{[^}]*?[,\\s]Clerk[,\\s][\\s\\S]*?from\\s+['\"]@clerk\\/fastify[\\s\\S]*?['\"]"
matcherFlags: 'm'
---

The `Clerk` default import has changed to `createClerkClient` and been moved to a named import rather than default. You must update your import path in order for it to work correctly. Example below of the fix that needs to be made:

```diff
- import Clerk from "@clerk/fastify"
+ import { createClerkClient } from "@clerk/fastify"
```
