---
'@clerk/clerk-js': patch
---

Drop throttling for multisession apps to fix edge cases when quickly switching between tabs with different sessions, in apps that have multisession support enabled.
