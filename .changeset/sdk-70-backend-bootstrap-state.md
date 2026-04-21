---
'@clerk/backend': minor
---

Add `createBootstrapSignedOutState` helper to `@clerk/backend/internal`. Returns a synthetic `UnauthenticatedState<'session_token'>` without requiring a publishable key or an `AuthenticateContext`. Intended for framework integrations that need to run authorization logic before real Clerk keys are available (e.g. the Next.js keyless bootstrap window).
