---
'@clerk/clerk-js': patch
---

Add a development-mode warning when exactly one of `routerPush` or `routerReplace` is provided in `ClerkOptions`. Both must be defined together for custom router navigation to work correctly.