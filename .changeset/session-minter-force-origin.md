---
'@clerk/clerk-js': patch
---

Send `force_origin=true` query param on `/tokens` requests when `skipCache` is true, so FAPI Proxy routes to origin instead of Session Minter.
