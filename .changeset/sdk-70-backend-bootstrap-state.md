---
'@clerk/backend': minor
---

Add `createBootstrapSignedOutState` helper to `@clerk/backend/internal`. Returns a synthetic `UnauthenticatedState<'session_token'>` without requiring a publishable key or an `AuthenticateContext`. Intended for framework integrations that need to run authorization logic before real Clerk keys are available (e.g. the Next.js keyless bootstrap window). Accepts optional `signInUrl`, `signUpUrl`, `isSatellite`, `domain`, and `proxyUrl` so that `createRedirect`-driven flows (including cross-origin satellite sign-in with the `__clerk_status=needs-sync` handshake marker) behave correctly during bootstrap.
