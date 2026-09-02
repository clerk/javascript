---
'@clerk/backend': patch
---

Add an internal `__internal_resolveHandshakeOnlyForNavigation` option to `authenticateRequest()` (defaults to `false`). When set to `true`, handshake cookies and query params are ignored on requests that cannot complete a handshake redirect (non-GET requests and `fetch`/XHR calls), so a stale handshake nonce no longer triggers a failing Backend API call on every request. Navigation requests are unaffected. Intended for API-only backends that cannot return `Set-Cookie` headers to the browser.
