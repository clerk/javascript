---
'@clerk/backend': patch
---

Strip `private_metadata` from the backend resource `_raw` payload in `stripPrivateDataFromObject`, preventing it from leaking into `__clerk_ssr_state` when a `User`/`Organization` resource is passed to `buildClerkProps`.
