---
'@clerk/ui': patch
---

Clear a revealed Directory Sync token when its directory is removed or replaced. Prevent an earlier rotation response from revealing a token for another directory.
