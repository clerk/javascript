---
title: '`apiKey` -> `secretKey` as param to getAuth'
matcher: "getAuth\\({[\\s\\S]*?apiKey:[\\s\\S]*?}\\)"
matcherFlags: 'm'
---

The `apiKey` argument passed to `getAuth` must be changed to `secretKey`.

```diff
- getAuth({ apiKey: '...' })
+ getAuth({ secretKey: '...' })
```
