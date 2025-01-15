---
'@clerk/nextjs': patch
---

Handle `dynamicIO` errors when request apis are accessed on prerender. This fixes issues with `ppr: true, dynamicIO: true` when using `<ClerkProvider dynamic/>`.
