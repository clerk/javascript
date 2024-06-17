---
title: '`httpOptions` parameter removed'
matcher: "\\([\\s\\S]*?httpOptions:\\s\\S]*?\\)"
matcherFlags: 'm'
category: 'skip'
---

The `httpOptions` parameter was removed from the internal `buildRequest` function but it is used by most public facing APIs. Hence you were able to pass `httpOptions` to some functions which is not possible anymore. If you're currently relying on this functionality and wish to update, please reach out to Clerk's support.

The internal change looks like this:

```diff
- const r = buildRequest({ httpOptions: { headers: {} }})
+ const request = buildRequest()
+ request({ headerParams: {} })
```
