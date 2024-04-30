---
'@clerk/shared': patch
---

Internal change to add client-side caching to Clerk's telemetry. This prevents event flooding in frequently executed code paths, such as for React hooks or components. Gracefully falls back to the old behavior if e.g. `localStorage` is not available. As such, no public API changes and user changes are required.
