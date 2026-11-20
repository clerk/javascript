---
'@clerk/backend': patch
---

Fix `__experimental_exchangeToken()` accepting malformed resource URIs and sparse scope arrays. Invalid resource components and a `scope` that is not an array or has missing or non-string elements now throw an `OAuthTokenExchangeError` before sending a request, while valid resource URIs are still sent unchanged. Plain `http` resources are now accepted only when the host is written literally as `localhost`, `127.0.0.1`, or `[::1]`.
