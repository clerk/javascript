---
'@clerk/backend': patch
'@clerk/react-router': patch
---

Fix `Request` cloning to omit cross-realm `AbortSignal`. Node 24's bundled undici tightened the `instanceof AbortSignal` check on `RequestInit.signal`, which broke cloning of framework-specific requests such as `NextRequest` (in `@clerk/backend`'s `ClerkRequest`) and any subclassed Request passed through `patchRequest` (in `@clerk/react-router`).
