---
'@clerk/clerk-js': patch
---

Remove handshake-related query parameters on load of clerk-js. It's possible that these parameters will be returned from Clerk's API, but they are only applicable for SSR-compatible frameworks and so on the client they are unused.
