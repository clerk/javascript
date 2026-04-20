---
"@clerk/expo": patch
---

Bump `clerk-android` to `1.0.13` to pick up credential flow and auth UI improvements from the native Android SDK. This addresses feedback from Expo customers including improved error messaging when no Google account is available on the device, correct handling of Activity context on Android 13 for Google Sign-In and Passkey flows, and silent dismissal when a user cancels passkey creation.
