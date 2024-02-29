---
'@clerk/backend': patch
---

Remove `__dev_session` legacy query param used to pass the Dev Browser token in previous major version.
This param will be visible only when using Account Portal with "Core 1" version.
