---
'@clerk/clerk-js': patch
---

`session.getToken()` no longer skips the network request when `navigator.onLine` reports `false`. Some environments, such as Chrome behind certain VPN clients, can report offline while the network works, which caused every token refresh to fail with `clerk_offline`. HTTP errors from the Frontend API, including ones with non-JSON bodies such as a proxy's HTML 502, are now surfaced as-is instead of being relabeled as `ClerkOfflineError`.
