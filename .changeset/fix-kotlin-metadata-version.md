---
'@clerk/expo': patch
---

Add `-Xskip-metadata-version-check` Kotlin compiler flag to resolve metadata version mismatch errors when building Android apps with Expo SDK 54/55. The `clerk-android` dependency is compiled with Kotlin 2.3.x while Expo ships Kotlin 2.1.x, causing `:app:compileDebugKotlin` to fail.
