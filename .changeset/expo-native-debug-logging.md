---
'@clerk/expo': patch
---

Improve diagnosability of native module initialization on Android.

- A failed native Clerk configuration is now logged as a warning in release builds instead of being silently swallowed. When this happens the JS SDK keeps working but the native components (`AuthView`, `UserProfileView`, `UserButton`) cannot render.
- Running `adb shell setprop log.tag.ClerkExpo DEBUG` now enables the Expo module's debug logs and clerk-android SDK debug logging at runtime, including in release builds.
