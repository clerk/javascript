---
'@clerk/expo': patch
---

`getToken` from `useAuth()` now keeps the same identity across renders. Effects and callbacks that list it as a dependency no longer re-run on every render, which could refetch tokens in a loop.
