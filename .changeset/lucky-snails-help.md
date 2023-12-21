---
'@clerk/backend': patch
---

Fixed a bug where backend API responses where missing error details. This was caused by parsing the errors twice once in the response error handling code and again when initializing the ClerkAPIResponseError.
