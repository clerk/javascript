---
'@clerk/ui': patch
---

Keep the Directory Sync setup step waiting for its latest user refresh. Prevent old setup callbacks from refreshing data or navigating after closure or a directory change, and handle refresh failures without an unhandled rejection.
