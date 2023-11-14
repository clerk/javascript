---
'@clerk/clerk-js': minor
---

Introducing default values for allowed redirect origins, this change will apply default values for the `allowedRedirectOrigins option`, if there is no value provided the defaults will be similar to the example below.

Let's assume the host of the application is `test.host`, the origins will be
- `https://test.host/`
- `https://test.host/*`
- `https://*.yourawesomeapp.clerk.accounts.dev/`
- `https://*.yourawesomeapp.clerk.accounts.dev/*`
