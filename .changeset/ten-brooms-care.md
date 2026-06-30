---
'@clerk/ui': patch
---

Fix the Organization Security page briefly re-rendering its loading state when test-run data refetches after the initial page load. Test-run loading now only gates the first page load; afterward it stays at the table level.
