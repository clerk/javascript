---
'@clerk/backend': patch
---

Remove __clerk_handshake_nonce query parameter from redirect URLs in development mode to prevent infinite loops.
