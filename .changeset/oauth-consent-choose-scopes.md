---
'@clerk/mosaic': minor
---

`OAuthConsent` now lets the user clear the scopes they don't want to grant, and posts only the scopes left checked. `offline_access` is listed as required and can't be cleared. The organization picker only shows while `user:org:read` is checked. The consent card also shows a warning when the application registered itself, and names the host when its details come from a client metadata document.
