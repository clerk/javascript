---
'@clerk/clerk-js': minor
'@clerk/clerk-react': minor
'@clerk/types': minor
---

Introduce `Clerk.status` for tracking the state of the clerk singleton.
Possible values are:
- `loading` set on during initialization
- `error` set when hotloading clerk-js failed or `Clerk.load()` failed
- `ready` set when Clerk is fully operational
- `degraded` set when Clerk is partially operational

`Clerk.loaded` is `true` when `Clerk.status` is either `ready` or `degraded`.
`Clerk.loaded` is `false` when `Clerk.status` is `loading` or `error`.
