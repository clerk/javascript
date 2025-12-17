---
'@clerk/react': patch
'@clerk/shared': patch
---

Ensure `useAuth().has` is always defined by defaulting to false when auth data is missing.
