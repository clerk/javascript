---
'@clerk/backend': minor
---

Verified OAuth access tokens expose `orgId` and `grantedOrgs`. `orgId` is the default organization of the grant, and `grantedOrgs` lists the organizations when the user granted two or more in one consent. Both are on the `oauth_token` auth object and on `IdPOAuthAccessToken`. `orgId` and `grantedOrgs` record what the user chose at consent. They are not a membership check.
