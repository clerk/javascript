---
'@clerk/shared': patch
---

Reword the missing/invalid key error messages so the Clerk Dashboard URL is no longer immediately followed by a period. Terminals and dev overlays were including the period in the link, producing a broken URL that failed to open the API Keys page.
