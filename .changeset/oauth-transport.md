---
'@clerk/shared': minor
'@clerk/clerk-js': minor
'@clerk/react': minor
'@clerk/ui': minor
---

Add internal OAuth transport support for native desktop SDK wrappers. Transport callbacks now reload the resource before callback handling, and OAuth retries with a pending provider redirect now start a fresh sign-in attempt.
