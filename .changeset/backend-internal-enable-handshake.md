---
'@clerk/backend': patch
---

Add an internal `__internal_resolveHandshakeOnlyForNavigation` option to `authenticateRequest()`, off by default. When it's on, requests that can't complete a handshake redirect (anything that isn't a GET, plus `fetch` and XHR calls) ignore handshake cookies and query params instead of exchanging them with the Backend API. Page navigations behave exactly as before. Turn it on for an API-only backend sitting behind a proxy that drops `Set-Cookie`, where a stale handshake nonce would otherwise cost a failing Backend API call on every request.
