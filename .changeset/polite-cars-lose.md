---
'@clerk/shared': patch
---

Fix `useClearQueriesOnSignOut` hook to comply with React Rules of Hooks by moving the `authenticated` check inside the `useEffect` callback. Also standardize `authenticated` and `isSignedIn` values across pagination hooks to use explicit null checks instead of Boolean coercion.
