---
'@clerk/expo-native-components': minor
---

Add native module support for the upcoming single-token client sync between `@clerk/expo` and the Clerk iOS and Android SDKs. The native SDK's stored device token becomes the one token both runtimes use, and each side is notified to reload its own client when the other changes it. Existing sync behavior is unchanged until `@clerk/expo` adopts it.
