---
title: '`__unstable_*` methods renamed to `__internal_*`'
matcher: '__unstable_'
category: 'breaking'
---

All `__unstable_*` methods have been renamed to `__internal_*`. These are internal APIs not intended for public use.

### @clerk/clerk-js

- `__unstable__environment` → `__internal_environment`
- `__unstable__updateProps` → `__internal_updateProps`
- `__unstable__setEnvironment` → `__internal_setEnvironment`
- `__unstable__onBeforeRequest` → `__internal_onBeforeRequest`
- `__unstable__onAfterResponse` → `__internal_onAfterResponse`
- `__unstable__onBeforeSetActive` → `__internal_onBeforeSetActive`
- `__unstable__onAfterSetActive` → `__internal_onAfterSetActive`

### @clerk/nextjs

- `__unstable_invokeMiddlewareOnAuthStateChange` → `__internal_invokeMiddlewareOnAuthStateChange`

### @clerk/chrome-extension

- `__unstable__createClerkClient` → `createClerkClient` (exported from `@clerk/chrome-extension/background`)
