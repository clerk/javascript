---
'@clerk/clerk-js': major
---

Renamed unstable methods to internal:
- `__unstable__environment` → `__internal_environment`
- `__unstable__updateProps` → `__internal_updateProps`
- `__unstable__setEnvironment` → `__internal_setEnvironment`
- `__unstable__onBeforeRequest` → `__internal_onBeforeRequest`
- `__unstable__onAfterResponse` → `__internal_onAfterResponse`
- `__unstable__onBeforeSetActive` → `__internal_onBeforeSetActive` (window global)
- `__unstable__onAfterSetActive` → `__internal_onAfterSetActive` (window global)
