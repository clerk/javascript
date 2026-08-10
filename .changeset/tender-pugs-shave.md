---
'@clerk/expo': patch
---

Keep a cached environment when the app starts offline and only the client cache is empty. Previously both resources fell back to placeholder data, so instance settings were lost until the app was restarted with a working network.

Repeated unauthenticated responses now share one native recovery attempt within a few seconds of each other, instead of reading native state and refetching the client for every response.

Fix the `tokenCache` prop documentation: the cache stores the client JWT, not the session token.
