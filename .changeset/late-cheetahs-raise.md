---
'@clerk/clerk-js': patch
---

Fix an edge case where `window.Clerk` is re-assigned if the Clerk script is injected multiple times.
