---
'@clerk/clerk-js': patch
---

Refactor the internal token cache so entry keys are derived through a dedicated `KeyResolver` module. This is an internal change with no effect on caching behavior or the public API.
