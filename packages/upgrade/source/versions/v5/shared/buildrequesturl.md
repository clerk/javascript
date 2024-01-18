---
title: '`getRequestUrl` -> `buildRequestUrl` from `@clerk/backend/internal`'
matcher: "getRequestUrl\\("
---

```diff
- import { getRequestUrl } from '@clerk/shared/proxy';
+ import { buildRequestUrl } from '@clerk/backend/internal';

- const url = getRequestUrl(req, '/your/path');
+ const url = buildRequestUrl(/* ??? */);
```
