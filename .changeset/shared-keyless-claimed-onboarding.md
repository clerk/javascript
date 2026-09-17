---
'@clerk/shared': minor
---

Add `completeClaimedOnboarding` and the `KeylessCompletionAPI` type to `@clerk/shared/keyless`. `createKeylessService` now accepts an API adapter without `createAccountlessApplication`, in which case `getOrCreateKeys()` only returns stored keys.
