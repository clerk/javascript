---
'@clerk/expo-native-components': patch
---

Fix a custom page in the iOS `UserProfileView` closing right after it opens when the profile was shown before the native SDK finished picking up the signed-in session.
