---
title: '`getRequestUrl` -> `buildRequestUrl` from `@clerk/backend`'
matcher:
---

```js
// before
import { getRequestUrl } from '@clerk/shared/proxy';
const url = getRequestUrl(req, '/your/path');

// after
import { buildRequestUrl } from '@clerk/backend';
const url = buildRequestUrl(/* ??? */);
```
