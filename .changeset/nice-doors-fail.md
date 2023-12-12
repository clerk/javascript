---
'@clerk/backend': major
---

- Refactor the `authenticateRequest()` flow to use the new client handshake endpoint. This replaces the previous "interstitial"-based flow. This should improve performance and overall reliability of Clerk's server-side request authentication functionality.
- `authenticateRequest()` now accepts two arguments, a `Request` object to authenticate and options:
  ```ts
  authenticateRequest(new Request(...), { secretKey: '...' })
  ```
