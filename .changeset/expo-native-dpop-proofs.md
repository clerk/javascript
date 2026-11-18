---
'@clerk/expo-native-components': minor
---

Support binding the client to the device. With a version of `@clerk/expo` that signs its requests, the bundled clerk-android or clerk-ios signs every Frontend API request the app sends with this device's hardware-backed key, so a client token copied off the device is rejected once the instance enforces device binding. With an older `@clerk/expo`, the client stays unbound, as before.
