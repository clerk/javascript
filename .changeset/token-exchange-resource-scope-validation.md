---
'@clerk/backend': patch
---

Fix `__experimental_exchangeToken()` accepting malformed resource URIs and sparse scope arrays. Invalid resource components and missing or non-string scope elements now throw an `OAuthTokenExchangeError` before sending a request, while valid resource URIs are still sent unchanged.
