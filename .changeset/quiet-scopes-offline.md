---
'@clerk/ui': patch
---

`<OAuthConsent />` and `<OAuthDeviceVerification />` no longer show an empty permissions list when an OAuth client requests only the `offline_access` scope.
