---
'@clerk/clerk-js': minor
'@clerk/types': minor
---

Introduce `Clerk.status` for tracking the state of the clerk singleton.
Possible values for `Clerk.status` are:
- `"loading"`: Set during initialization
- `"error"`: Set when hotloading clerk-js failed or `Clerk.load()` failed
- `"ready"`: Set when Clerk is fully operational
- `"degraded"`: Set when Clerk is partially operational

The computed value of `Clerk.loaded` is:
- `true` when `Clerk.status` is either `"ready"` or `"degraded"`.
- `false` when `Clerk.status` is `"loading"` or `"error"`.
