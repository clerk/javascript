---
'@clerk/expo': patch
---

Fix Android native components rendering an empty screen when opened before the native SDK finishes initializing, and improve diagnosability of native module initialization on Android.

- `AuthView` and `UserProfileView` on Android now show a loading indicator until the native Clerk SDK has loaded its configuration, instead of permanently rendering an incomplete screen when opened too early (for example on a slow network).
- A failed native Clerk configuration is now logged as a warning in release builds instead of being silently swallowed. When this happens the JS SDK keeps working but the native components (`AuthView`, `UserProfileView`, `UserButton`) cannot render.
- Running `adb shell setprop log.tag.ClerkExpo DEBUG` now enables the Expo module's debug logs and clerk-android SDK debug logging at runtime, including in release builds.
