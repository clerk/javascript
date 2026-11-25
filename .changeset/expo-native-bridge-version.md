---
'@clerk/expo': patch
'@clerk/expo-native-components': patch
---

Log an error that tells you to update `@clerk/expo` and `@clerk/expo-native-components` together and rebuild when the app's native build doesn't match `@clerk/expo`. Native components used to render blank with no explanation in that case, including in release builds that get `@clerk/expo` through an over-the-air update.
