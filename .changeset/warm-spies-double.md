---
'@clerk/backend': patch
---

Enforce the `azp` (authorized party) claim when `authorizedParties` is configured. Previously, a session token that was missing the `azp` claim was accepted even when `authorizedParties` was set, allowing the authorized-parties check to be bypassed by omitting the claim. Now, when `authorizedParties` is configured, a token with a missing or empty `azp` claim is rejected. Tokens without `azp` continue to be accepted when no `authorizedParties` are configured.
