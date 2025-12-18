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

* All `@clerk/react`-based packages: Removes ability to pass in `initialAuthState` to `useAuth`
  * This was added for internal use and is no longer needed
  * Instead pass in `initialState` to the `<ClerkProvider>`, or `dynamic` if using the Next package
  * See your specific SDK documentation for more information on Server Rendering
* `@clerk/shared`: Removes now unused contexts `ClientContext`, `SessionContext`, `UserContext` and `OrganizationProvider`
  * We do not anticipate public use of these
  * If you were using any of these, file an issue to discuss a path forward as they are no longer available even internally

New features:

* `@clerk/clerk-js`: `addListener` now takes a `skipInitialEmit` option that can be used to avoid emitting immediately after subscribing

Fixes:

* A bug where `useAuth` would sometimes briefly return the `initialState` rather than `undefined`
  * This could in certain situations incorrectly lead to a brief `user: null` on the first page after signing in, indicating a signed out state
* Hydration mismatches in certain rare scenarios where subtrees would suspend and hydrate only after `clerk-js` had loaded fully
