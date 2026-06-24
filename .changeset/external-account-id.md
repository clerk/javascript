---
'@clerk/backend': patch
---

Add `externalAccountId` to the backend `ExternalAccount` resource. This exposes the external account's `eac_`-prefixed id returned by `getUser()`, which is the id `users.deleteUserExternalAccount()` expects. Previously only the `idn_`-prefixed identification id was reachable through `id`, so deleting an external account fetched from `getUser()` failed with a 404.
