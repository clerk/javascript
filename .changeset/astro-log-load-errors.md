---
'@clerk/astro': patch
---

Log `Clerk.load()` failures to the console instead of silently swallowing them, making component mount failures diagnosable.
