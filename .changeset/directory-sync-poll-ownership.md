---
'@clerk/ui': patch
---

Stop Directory Sync setup polling when the wizard closes or its account or organization changes. Avoid starting another polling request while a refresh is pending.
