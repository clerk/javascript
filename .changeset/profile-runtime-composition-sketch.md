---
'@clerk/ui': patch
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Keep composed profile runtime wiring inside the UI package instead of exposing Clerk's module manager as a new internal API.
