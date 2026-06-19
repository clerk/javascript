---
"@clerk/expo": minor
---

Fixes iOS development builds across Expo SDK versions by linking the Clerk iOS SDK through React Native's Swift Package Manager podspec support. This raises the minimum supported React Native version to 0.75, where that podspec SPM support is available; `@clerk/expo` already supports Expo SDK 53 and newer, and Expo SDK 53 ships with React Native 0.79.
