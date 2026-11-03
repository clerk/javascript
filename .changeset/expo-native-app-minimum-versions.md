---
'@clerk/expo': minor
---

Support the minimum app versions set in the Clerk Dashboard. When your iOS or Android app's version is older than its minimum, Clerk rejects the app's requests until the user updates, and `<ClerkProvider>` shows an update screen over your app with a link to the store and, when your instance has a support email, a way to contact support.

To show your own screen instead, set `updateRequiredViewEnabled={false}` on `<ClerkProvider>` and read the new `useAppVersionSupport()` hook, which returns `isSupported`, `currentVersion`, `minimumVersion`, and `updateUrl`.

Install `expo-application` (`npx expo install expo-application`), which Clerk uses to read your app's bundle ID or package name and its version. Without it, `useAppVersionSupport()` always reports the app as supported, Clerk doesn't block requests made from JavaScript, and `<ClerkProvider>` shows no update screen. If you use `@clerk/expo-native-components`, the native iOS and Android SDKs still identify the app themselves, so their requests are blocked and they show their own update screen. Apps in Expo Go and web apps are never blocked.
