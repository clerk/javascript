---
'@clerk/shared': patch
'@clerk/clerk-js': patch
'@clerk/react': patch
---

Move ownership of the clerk-rq `QueryClient` from `@clerk/clerk-js` into `@clerk/shared`. The `QueryObserver` (constructed in `@clerk/shared`) and the `Query` objects it observes now always come from a single `@tanstack/query-core` resolution — the cross-bundle API contract that produced #8428 (`Query.isFetched is not a function`) no longer exists.

This removes the undocumented `clerk.__internal_queryClient` getter from both `@clerk/clerk-js` and `@clerk/react`'s `IsomorphicClerk`. The `QueryClient` is owned by an internal singleton in `@clerk/shared`, lazily instantiated on the browser only — server renders return `undefined`, preserving SSR safety and avoiding cross-request cache sharing.

`@tanstack/query-core` is no longer a direct dependency of `@clerk/clerk-js`; it remains a dep of `@clerk/shared` and resolves consumer-side as before.
