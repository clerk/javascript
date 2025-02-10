---
title: '`request` separated from `options` as params to `authenticateRequest`'
warning: true
category: 'skip'
matcher: "authenticateRequest\\("
---

There has been a change to the way the params of the `authenticateRequest` function are structured. The `request` param, formerly included in an `options` object, has been moved to stand on its own as the first param to the function, while the `options` object remains as the second param. Example below:

```diff
- clerkClient.authenticateRequest({ ...opts, request })
+ clerkClient.authenticateRequest(request, { ...opts })
```
