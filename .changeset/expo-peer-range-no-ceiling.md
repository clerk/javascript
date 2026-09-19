---
'@clerk/expo': minor
'@clerk/expo-passkeys': minor
'@clerk/expo-google-signin': minor
---

Remove the upper bound from the `expo` peer dependency range. The packages now accept any Expo SDK from 54 upward, so upgrading to a new SDK no longer produces peer dependency warnings, or install failures on npm, while waiting for a Clerk release that widens the range.
