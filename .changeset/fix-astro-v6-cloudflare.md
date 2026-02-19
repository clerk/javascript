---
'@clerk/astro': patch
---

Fix compatibility with Astro v6 Cloudflare adapter by using `cloudflare:workers` env when `locals.runtime.env` is unavailable
