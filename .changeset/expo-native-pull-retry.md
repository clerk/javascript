---
'@clerk/expo': patch
---

Fix the JS SDK staying signed out after a native sign-in when the network request that syncs it failed. The SDK now retries the sync, and if it still fails, syncs again the next time the app returns to the foreground.
