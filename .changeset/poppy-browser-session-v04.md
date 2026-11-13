---
"@clerk/backend": minor
"@clerk/nextjs": minor
---

Add experimental support for Poppy 0.4 signed-in browser sessions with full account access. Enable the Clerk-defined `__experimental_poppy: true` option on `clerkMiddleware()` to publish Poppy and OAuth protected resource discovery on the application domain. Clerk hosts the browser session endpoint and uses its existing handshake to establish application cookies.

Agent-attributed sessions use normal Clerk session JWT verification, renewal, and revocation behavior. Already-issued JWTs remain usable until expiry. Read agent attribution through the common Clerk-defined `auth().agent` shape: `type`, `sub`, and `task_id` when present. Signed-out visitors have no authenticated agent identity.
