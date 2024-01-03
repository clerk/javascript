---
title: '`frontendApi` -> `publishableKey` as param to authMiddleware'
matcher: "authMiddleware\\({.*?frontendApi:.*?}\\)"
matcherFlags: 'm'
---

<!-- TODO: is there a possible issue with import matching? this from `@clerk/nextjs` -->

The `frontendApi` argument passed to `authMiddleware` must be changed to `publishableKey`
