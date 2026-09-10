---
'@clerk/clerk-js': patch
---

Preserve loaded resource state when a refresh returns an explicitly null response. This prevents an empty client refresh from discarding a native application's current session or pending session task.
