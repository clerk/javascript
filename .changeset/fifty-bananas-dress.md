---
'@clerk/clerk-js': patch
'@clerk/types': patch
---

Introduce the `experimental.rethrowOfflineNetworkErrors` option to the `ClerkProvider` component. 

When set to `true`, Clerk will rethrow network errors that occur while the user is offline.
