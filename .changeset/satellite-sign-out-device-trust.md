---
'@clerk/clerk-js': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Fixes signing out of all accounts on satellite domains to preserve device recognition when Device Trust and client persistence are enabled. Preserves existing navigation callbacks when cross-domain repair is unavailable, and skips the repair redirect when Device Trust or client persistence is disabled. Malformed redirect URLs no longer prevent the sign-out request.
