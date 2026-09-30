---
'@clerk/electron': minor
---

- OAuth sign-in now fails with a clear Clerk error explaining that `createClerkBridge()` needs the `renderer` option, instead of Electron's generic "No handler registered" error.
- Telemetry now identifies the SDK as `@clerk/electron` instead of `@clerk/react`.
- Add `@clerk/electron/react/legacy` and `@clerk/electron/react/experimental` entry points, matching `@clerk/react/legacy` and `@clerk/react/experimental`.
