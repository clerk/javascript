---
'@clerk/clerk-js': patch
---

Fix development instance initialization when a stale dev browser value is rejected by clearing the value and retrying the environment and client requests.
