---
title: '`cjs/instance` and `esm/instance` imports no longer needed'
matcher: "@clerk\\/clerk-sdk-node(\\/(?:cjs|esm)\\/instance)"
replaceWithString: ''
---

If you are using either of these import paths, they are no longer necessary and you can import directly from the top level `@clerk/express` path.

```js
// before
import { ... } from "@clerk/clerk-sdk-node/esm/instance";
import { ... } from "@clerk/clerk-sdk-node/cjs/instance";

// after
import { ... } from "@clerk/clerk-sdk-node";
```
