---
'@clerk/clerk-js': patch
---

`createAllowedRedirectOrigins` now takes the instance type into account to include Frontend API URL for development instances. This is necessary to properly support Clerk as an IdP with OAuth for development instances.
