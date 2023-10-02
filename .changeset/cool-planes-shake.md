---
'@clerk/backend': patch
---

Improve the `jwk-remote-missing` error by adding the available JWK IDs to the error message. This way you can understand why the entry was not found and compare the available ones with other keys.
