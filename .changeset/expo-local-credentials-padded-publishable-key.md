---
'@clerk/expo': patch
---

Fix `useLocalCredentials` throwing "Invalid key provided to SecureStore" when the publishable key ends with base64 padding (`=`).
