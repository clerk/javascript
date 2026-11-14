---
'@clerk/backend': minor
---

Add `clerkClient.hostedAuth.exchangeCode()` and `clerkClient.hostedAuth.refreshSession()`. With hosted web auth (in private beta), your server exchanges the one-time code it receives on its callback for a session, and later refreshes that session's token.
