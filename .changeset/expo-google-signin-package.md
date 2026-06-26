---
'@clerk/expo': major
'@clerk/expo-google-signin': minor
---

Move native Google Sign-In out of `@clerk/expo` and into `@clerk/expo-google-signin`.

Apps using native Google Sign-In should install `@clerk/expo-google-signin`, add it to the Expo config plugin list alongside `@clerk/expo`, and rebuild their native app. The `@clerk/expo/google` import path continues to re-export `useSignInWithGoogle`.
