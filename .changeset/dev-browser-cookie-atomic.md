---
'@clerk/clerk-js': patch
'@clerk/backend': patch
---

Development instances no longer drop the suffixed `__clerk_db_jwt` cookie while rewriting it, which was causing intermittent `dev-browser-missing` 401s on concurrent requests.
