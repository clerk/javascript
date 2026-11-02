---
'@clerk/clerk-js': patch
---

Abort `/environment` and session-token POSTs after the same 7s bound used for `/client`, so `Clerk.load()` and `getToken()` cannot hang forever on React Native when the network stalls.
