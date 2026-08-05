---
'@clerk/backend': patch
---

Improve editor hover types for `authenticateRequest()`, `auth()`, and `getAuth()` when using `acceptsToken`. Machine auth results now display as named discriminated unions (e.g. `AuthenticatedMachineObjectFor<"api_key"> | UnauthenticatedMachineObjectFor<"api_key">`) instead of expanded intersection types.
