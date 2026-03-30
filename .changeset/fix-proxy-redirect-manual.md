---
'@clerk/backend': patch
---

Fix frontend API proxy following redirects server-side instead of passing them to the browser. The proxy's `fetch()` call now uses `redirect: 'manual'` so that 3xx responses from FAPI (e.g. after OAuth callbacks) are returned to the client as-is, matching standard HTTP proxy behavior.
