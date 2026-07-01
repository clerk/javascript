---
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Fail fast when the Clerk Frontend API (FAPI) is slow or unreachable during load. The client request and the load-recovery token mint are now bounded by a timeout, so a cold `Clerk.load()` renders identity from the session cookie in seconds instead of hanging while retries run. Adds a `timeLimit` utility to `@clerk/shared/utils`.
