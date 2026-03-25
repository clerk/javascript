---
'@clerk/backend': patch
---

Fix `ERR_CONTENT_DECODING_FAILED` when loading proxied assets by requesting uncompressed responses from FAPI and stripping `Content-Encoding`/`Content-Length` headers that `fetch()` invalidates through auto-decompression.
