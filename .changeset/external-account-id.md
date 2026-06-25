---
'@clerk/backend': patch
---

Add an optional `externalAccountId` to the backend `ExternalAccount` resource. For Google and Facebook accounts the resource `id` is the `idn_`-prefixed identification id, which `users.deleteUserExternalAccount()` rejects; `externalAccountId` now exposes the `eac_`-prefixed id those calls expect. For all other providers `id` is already the `eac_` id and `externalAccountId` is `undefined`, so use `externalAccountId ?? id` to get an id you can delete with.
