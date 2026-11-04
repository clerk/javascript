---
'@clerk/clerk-js': patch
---

Fix `getToken()` and React Native startup hanging when a Frontend API request never gets a response. In React Native, session token requests now time out after 10 seconds and are retried. In React Native apps that use `__experimental_resourceCache`, startup requests time out after 7 seconds and Clerk loads from the cached resources. Token requests in browsers are unchanged.
