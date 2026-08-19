---
'@clerk/expo-google-signin': patch
---

Fix iOS Google sign-in failing with `GOOGLE_SIGN_IN_ERROR` in apps with more than one window or scene. The presenting view controller is now resolved from the key window of the foreground-active scene instead of an arbitrary window, so overlays such as splash screens or windows created by other modules no longer break the sign-in flow.
