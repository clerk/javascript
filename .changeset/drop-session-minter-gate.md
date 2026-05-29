---
"@clerk/clerk-js": minor
"@clerk/shared": minor
---

Always use the Session Minter request shape for `/tokens` calls. The previous gate, sourced from `auth_config.session_minter` on the environment payload, is removed so all instances send the prior session token in the request body and `forceOrigin=true` when `skipCache` is set. The FAPI proxy strips both fields when no minter is reachable, so behavior is unchanged for instances not yet enrolled. The legacy `expired_token` retry path on 422 `missing_expired_token` is no longer needed and has been deleted.

`AuthConfigResource.sessionMinter` and `AuthConfigJSON.session_minter` are removed.
