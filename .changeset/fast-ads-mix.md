---
'@clerk/clerk-js': minor
---

Introducing default values for `allowedRedirectOrigins`. If no value is provided, default values similar to the example below will apply.

Let's assume the host of the application is `test.host`, the origins will be
- `https://test.host/`
- `https://yourawesomeapp.clerk.accounts.dev/`
- `https://*.yourawesomeapp.clerk.accounts.dev/`
