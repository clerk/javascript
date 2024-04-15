---
"@clerk/clerk-js": patch
---

Make UI-triggered redirects default to hash-based routing. If a routing strategy is not provided, default to hash routing. All routing strategies know how to convert a hash-based url to their own format.
