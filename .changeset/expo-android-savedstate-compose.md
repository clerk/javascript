---
'@clerk/expo': patch
---

Fix Android release builds on Expo SDK 58. The native module now declares the `androidx.savedstate:savedstate-compose` dependency it uses, which Android Gradle Plugin 9 no longer places on the compile classpath transitively, and ships a consumer R8 rule for the Kotlin 2.3 `kotlin.MustUseReturnValues` annotation that the Clerk Android SDK's dependencies reference, which SDK 58's default R8 minification flagged as a missing class.
