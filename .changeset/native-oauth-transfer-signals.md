---
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Fix native OAuth transport handling for combined sign-in-or-up flows so transfer callbacks can continue instead of surfacing a generic OAuth callback failure.
