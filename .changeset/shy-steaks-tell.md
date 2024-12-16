---
'@clerk/clerk-js': patch
---

fix: Properly detect and create devBrowser when the suffixed version is missing but an unsuffixed version exists

If the __clerk_db_jwt referred to a different instance, we’d fetch `/environment` and `/client` with mismatched publishable keys and JWTs, breaking the app.   
