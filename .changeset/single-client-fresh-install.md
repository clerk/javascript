---
'@clerk/expo': patch
---

Fix a sign-in made in the first moments after a fresh install failing with `No session was found` when `@clerk/expo-native-components` is installed. On a device with no stored client token, `@clerk/expo` now waits briefly for the native Clerk SDK to load before its first request, so JS and native share one client instead of each creating its own.
