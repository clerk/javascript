---
'@clerk/shared': patch
'@clerk/clerk-js': patch
---

Raise the `@tanstack/query-core` floor to `^5.100.6` in the repo catalog and consume it from `@clerk/shared` and `@clerk/clerk-js` so the version baked into the production `clerk-js` CDN bundle stays in lockstep with what consumer-side `@clerk/shared` resolves to.

Fixes a runtime crash (`TypeError: e.isFetched is not a function`) introduced when consumer dedupe resolved `query-core` to `5.100.x` (which adds `Query.isFetched()`) while the published CDN bundle still embedded `5.90.16`. The new `QueryObserver` then called `isFetched()` on `Query` objects from the older bundled version.
