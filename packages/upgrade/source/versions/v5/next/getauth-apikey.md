---
title: '`apiKey` -> `secretKey` as param to getAuth'
matcher: "getAuth\\({.*?apiKey:.*?}\\)"
matcherFlags: 'm'
---

<!-- TODO: is there a possible issue with import matching? this from `@clerk/nextjs/server` -->

The `apiKey` argument passed to `getAuth` must be changed to `secretKey`
