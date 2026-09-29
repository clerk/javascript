---
'@clerk/nextjs': patch
---

Removed the period from the end of the displayed error. Agents were trying to use the URL with period at the end and getting 404s
