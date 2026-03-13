---
'@clerk/backend': patch
---

Fix POST requests with `sec-fetch-dest: document` incorrectly triggering handshake redirects, resulting in 405 errors from FAPI. Non-GET requests (e.g. native form submissions) are now excluded from handshake and multi-domain sync eligibility.
