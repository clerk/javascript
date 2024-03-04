---
'@clerk/backend': patch
---

The signJwt function preserves the value of the 'iat' claim, falling back to the current time if the claim is not present in the payload
