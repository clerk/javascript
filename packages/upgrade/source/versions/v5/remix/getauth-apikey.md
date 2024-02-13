---
title: '`apiKey` -> `secretKey` as argument to getAuth'
matcher: "getAuth\\({[\\s\\S]*?apiKey:[\\s\\S]*?}\\)"
category: 'deprecation-removal'
matcherFlags: 'm'
---

The `apiKey` argument passed to `getAuth` must be changed to `secretKey`.

```diff
import { getAuth } from '@clerk/remix/ssr.server';

export const loader: LoaderFunction = async args => {
-  return getAuth(args, { apiKey: '...' });
+  return getAuth(args, { secretKey: '...' });
};
```
