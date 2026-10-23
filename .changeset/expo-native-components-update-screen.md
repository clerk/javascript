---
'@clerk/expo-native-components': patch
---

Turn off the native iOS and Android SDKs' own update-required screens, so an app whose version is older than its minimum sees only the `<UpdateRequiredView />` that `<ClerkProvider>` shows, and `updateRequiredViewEnabled={false}` on `<ClerkProvider>` turns it off on every platform.
