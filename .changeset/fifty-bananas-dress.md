---
'@clerk/clerk-js': patch
'@clerk/types': patch
'@clerk/clerk-expo': patch
---

Introduce the `experimental.rethrowOfflineNetworkErrors` option to the `ClerkProvider` component. 

When set to `true`, Clerk will rethrow network errors that occur while the user is offline.
On Expo, the EXPO_PUBLIC_CLERK_EXPERIMENTAL_RETHROW_OFFLINE_NETWORK_ERRORS environment variable is used.
