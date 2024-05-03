---
'@clerk/clerk-js': patch
---

Specify an explicit domain when setting the client_uat and clerk_db_jwt cookies. This ensures there are no duplicate cookie issues when also recieving cookies from the API.
