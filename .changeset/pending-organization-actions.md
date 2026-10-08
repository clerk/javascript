---
'@clerk/ui': patch
---

Prevent duplicate organization invitation and join request actions while a request is pending. Ignore retained actions after the active user or organization changes, and clear action errors when the user retries.
