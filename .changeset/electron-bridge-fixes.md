---
'@clerk/electron': minor
---

- OAuth sign-in without the `renderer` option in `createClerkBridge()` now throws a Clerk error that asks for it. Previously it failed with Electron's "No handler registered" error.
- Telemetry now reports `@clerk/electron` instead of `@clerk/react`.
- Add a `@clerk/electron/react/experimental` entry point that re-exports `@clerk/react/experimental`.
