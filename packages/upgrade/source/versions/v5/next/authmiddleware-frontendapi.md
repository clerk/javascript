---
title: '`frontendApi` -> `publishableKey` as param to authMiddleware'
matcher: "authMiddleware\\({[\\s\\S]*?frontendApi:[\\s\\S]*?}\\)"
matcherFlags: 'm'
---

<!-- TODO: is there a possible issue with import matching? this from `@clerk/nextjs` -->

The `frontendApi` argument passed to `authMiddleware` must be changed to `publishableKey`
