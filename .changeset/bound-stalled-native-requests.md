---
'@clerk/clerk-js': patch
---

Fix `getToken()` and React Native startup hanging when a Frontend API request never gets a response. A stalled session token request is now aborted after 10 seconds and retried, so later `getToken()` calls no longer wait on it until the app restarts. In React Native apps that use `__experimental_resourceCache`, a stalled `/environment` or `/client` request at startup is aborted after 7 seconds and Clerk loads from the cached resources.
