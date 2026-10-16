---
'@clerk/expo-native-components': patch
---

Fix Android builds on Expo SDK 58. Release builds no longer fail with `Unresolved reference 'LocalSavedStateRegistryOwner'` while compiling `@clerk/expo-native-components`.
