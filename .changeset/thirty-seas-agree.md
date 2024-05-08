---
'@clerk/clerk-js': patch
---

Specify an explicit domain when setting the client_uat cookie. This ensures there are no duplicate cookie issues when also receiving cookies from the API.
