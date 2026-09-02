---
'@clerk/expo': patch
---

Fix the Android `<AuthView>` rendering no sign-in form when it is opened within a couple of seconds of `isLoaded` turning true. The native view now recreates itself once the Clerk Android SDK finishes loading instead of staying empty until it is dismissed and reopened.
