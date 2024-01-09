---
'@clerk/clerk-js': patch
---

Exclude external custom links from route matching. Previously adding external links to custom pages would cause all pages that are defined below it to throw an error.
