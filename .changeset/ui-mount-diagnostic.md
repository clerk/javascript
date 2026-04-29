---
"@clerk/ui": patch
---

Surface initialization errors and stalled mounts in the component renderer. The internal `ensureMounted` pipeline now logs a `[Clerk UI]` error to the console when the lazy module import rejects, and emits a diagnostic warning if the renderer has not mounted within 10 seconds. Makes silent failures (e.g. failed dev-server chunk loads, unresolved lazy-compilation proxies) surface with an actionable message instead of hanging without feedback.
