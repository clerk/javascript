---
'@clerk/shared': patch
---

Support passing the env as argument in runtime environment helpers (eg isDevelopmentEnvironment())
to allow using those helpers with per-request environment runtimes (eg Cloudflare workers).