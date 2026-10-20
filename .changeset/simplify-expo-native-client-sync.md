---
'@clerk/expo': minor
---

Rewrite the sync between the Clerk JS client and the native Clerk SDK. Both now share a single device token stored by the native SDK. This fixes a stale token in the app's `tokenCache` signing out a session that was signed in natively, and the two SDKs ending up on different tokens when both rotated the device token at the same time.

If you use the native components, update `@clerk/expo-native-components` to 0.3.0 or later and ship a new app build. Builds made with an older version render the native components blank, so don't deliver this version to them as an over-the-air update.
