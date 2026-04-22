---
'@clerk/backend': patch
---

Fix `ClerkRequest` cloning to omit cross-realm `AbortSignal` when reusing an input `Request` as init. Node 24's bundled undici tightened the `instanceof AbortSignal` check on `RequestInit.signal`, which broke cloning of framework-specific requests such as `NextRequest`.
