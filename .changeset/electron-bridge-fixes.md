---
'@clerk/electron': minor
---

- OAuth sign-in now fails with a clear Clerk error explaining that `createClerkBridge()` needs the `renderer` option, instead of Electron's generic "No handler registered" error.
- Telemetry now identifies the SDK as `@clerk/electron` instead of `@clerk/react`.
- Add a `@clerk/electron/react/experimental` entry point, matching `@clerk/react/experimental`.
