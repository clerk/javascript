---
'@clerk/expo': patch
---

Fix native components such as `UserButton` occasionally staying signed out after a JS sign-in. When the sign-in finished while the SDK was syncing a change from the native SDK, the native SDK was never refreshed with the new session.
