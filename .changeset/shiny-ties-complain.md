---
'@clerk/remix': patch
---

Replace `response.clone()` with `new Response(response.body, response)` to avoid creating multiple branches of a single stream on Cloudflare workers ([issue reference](https://github.com/cloudflare/workers-sdk/issues/3259)).
