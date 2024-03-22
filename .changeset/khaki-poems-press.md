---
'@clerk/nextjs': patch
---

Adds telemetry event to clerkMiddleware initialization, passes publishableKey to `createClerkClient()` internally.
