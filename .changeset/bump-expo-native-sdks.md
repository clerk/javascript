---
"@clerk/expo": patch
---

Bump the native SDKs pulled into Expo: `clerk-ios` to `1.2.0` and `clerk-android-api`/`clerk-android-ui` to `1.0.28`. Android native components now pass through the existing `<AuthView mode>`, `<AuthView isDismissible>`, and `<UserProfileView isDismissible>` props to the underlying native SDK.
