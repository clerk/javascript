---
'@clerk/expo-native-components': patch
---

Let `@clerk/expo` turn off the native iOS and Android SDKs' own update-required screens. `<ClerkProvider>` turns them off when it shows its own update screen, or when you set `updateRequiredViewEnabled={false}`, so an app whose version is older than its minimum sees one screen. Older versions of `@clerk/expo`, and apps without `expo-application`, which `@clerk/expo` needs to identify the app, keep the native screen.
