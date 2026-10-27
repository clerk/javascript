---
'@clerk/clerk-js': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Fixes signing out of all accounts on satellite domains so sign-out completes across domains and preserves device recognition when client persistence is enabled. Preserves existing navigation callbacks when cross-domain repair is unavailable.
