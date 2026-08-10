---
'@clerk/expo': patch
---

The native components (`AuthView`, `UserProfileView`, `UserButtonView`) now respect the `proxyUrl` passed to `<ClerkProvider>` and route Frontend API requests through the configured proxy.
