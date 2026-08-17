---
'@clerk/expo-google-signin': patch
---

Pass the underlying Android Credential Manager message through when a sign-in is cancelled, so `@clerk/expo` can tell a provider failure apart from a dismissed account chooser. Upgrade `@clerk/expo` alongside this and rebuild your native app to get the fix.
