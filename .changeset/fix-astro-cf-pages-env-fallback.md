---
"@clerk/astro": patch
---

Fix Cloudflare Pages compatibility by falling through to `locals.runtime.env` when `cloudflare:workers` env is missing the requested key
