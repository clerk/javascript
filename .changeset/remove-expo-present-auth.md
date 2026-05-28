---
'@clerk/expo': minor
---

Update the beta Expo prebuilt component APIs to align more closely with the native Clerk SDKs.

Remove unused Expo prebuilt-view bridge code: the native `presentAuth` and `presentUserProfile` bridges, Android presentation activities/factory paths, the user-profile modal hook, and stale `Inline*` source files now superseded by app-presented `AuthView` and `UserProfileView`.

Align `UserButton` with the native Clerk SDKs by wrapping the platform-native user button, letting it present the user profile from the button itself.
