---
'@clerk/clerk-js': patch
---

Fix `getToken()` returning an expired session token when the device clock runs behind the server. Requests from those browsers no longer fail with expired-token errors until the cache evicts the token.
