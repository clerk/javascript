---
'@clerk/expo': patch
---

Fix a race on Android where the native module refreshed the client every time the app returned to the foreground, which could mint a duplicate client during browser SSO completion and cause `401 authentication_invalid` errors right after signing in. The native SDK is now initialized with its foreground client refresh disabled, since the JavaScript layer owns client state. Session token refresh and shared session sync are unaffected.
