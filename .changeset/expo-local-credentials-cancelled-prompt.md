---
'@clerk/expo': patch
---

Fix `useLocalCredentials()` reporting `hasCredentials` as `true` after the biometric prompt is cancelled during `setCredentials()`. A cancelled prompt now leaves the stored credentials unchanged, so `authenticate()` no longer fails with a missing password.
