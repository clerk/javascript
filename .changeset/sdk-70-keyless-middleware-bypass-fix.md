---
'@clerk/nextjs': patch
---

Fix a middleware-bypass window in keyless mode. When `clerkMiddleware` runs before a publishable key has been provisioned (the client-side keyless bootstrap window), the user's middleware handler now runs against a synthetic signed-out `RequestState` instead of being skipped. Authorization logic (`auth.protect()`, custom checks) is enforced fail-closed during bootstrap; `<ClerkProvider/>` downstream resumes the flow once keys are available. Dev-only path — production behavior is unchanged.
