---
'@clerk/nextjs': major
'@clerk/shared': major
'@clerk/react': major
'@clerk/expo': major
'@clerk/chrome-extension': major
'@clerk/react-router': major
'@clerk/clerk-js': minor
'@clerk/tanstack-react-start': minor
---

Refactor React SDK hooks to subscribe to auth state via `useSyncExternalStore`. This is a mostly internal refactor to unlock future improvements, but includes a few breaking changes and fixes.

Breaking changes:

* Removes ability to pass in `initialAuthState` to `useAuth`
  * This was added for internal use and is no longer needed
  * Instead pass in `initialState` to the `<ClerkProvider>`, or `dynamic` if using the Next package
  * See your specific SDK documentation for more information on Server Rendering

Fixes:

* A bug where `useAuth` would sometimes briefly return the `initialState` rather than `undefined`
  * This could in certain situations incorrectly lead to a brief `user: null` on the first page after signing in, indicating a signed out state
* Hydration mismatches in certain rare scenarios where subtrees would suspend and hydrate only after `clerk-js` had loaded fully
