---
'@clerk/expo': patch
---

Fix Android builds on Expo SDK 58. Release builds no longer fail with `Unresolved reference 'LocalSavedStateRegistryOwner'` while compiling `@clerk/expo`, or with `Missing class kotlin.MustUseReturnValues` from R8, which SDK 58 now enables by default.
