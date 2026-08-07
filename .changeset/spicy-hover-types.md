---
'@clerk/backend': patch
---

Improve editor hover types for `authenticateRequest()`, `auth()`, and `getAuth()` when using `acceptsToken`. Machine auth results now display as named discriminated unions (e.g. `AuthenticatedMachineObjectFor<"api_key"> | UnauthenticatedMachineObjectFor<"api_key">`) instead of expanded intersection types.

The internal `InferAuthObjectFromToken` and `InferAuthObjectFromTokenArray` types are deprecated in favor of the new `InferAuthObject` type and will be removed in the next major version.

Narrowing a `RequestState` by `tokenType` now also narrows the return type of `toAuth()`, and debug data is no longer dropped when an auth object is downgraded because its token type did not match `acceptsToken`.
