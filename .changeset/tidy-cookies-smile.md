---
'@clerk/backend': patch
---

Decode request cookie values only after parsing cookie boundaries, preserving malformed percent encodings and preventing encoded delimiters from being treated as separate cookies.
