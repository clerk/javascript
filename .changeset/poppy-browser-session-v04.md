---
"@clerk/backend": minor
"@clerk/nextjs": minor
---

Add Poppy 0.4 website browser Sessions. Enable `__experimental_poppy: true` on `clerkMiddleware()` and read authenticated agent attribution through `auth().agent`. The same option serves Poppy and OAuth protected resource discovery from the Backend API artifact. Signed-in connections use the normal Clerk ticket sign-in and Session activation flow.

The Backend SDK checks current OAuth authority for Poppy-derived Clerk Session JWTs. Sign-out or revocation ends account access and removes the agent from the auth object.

The live Session resolver and metadata helper are available through `clerkClient.__experimental_poppy` while the API is experimental.

The server auth object exposes `agent` only for an authenticated Clerk Session with agent attribution, using the existing `session.agent` shape. For a verified Poppy account session, `agent` also carries `__experimental_poppyClientId`, `__experimental_poppyUserId`, and `__experimental_poppySessionId`. These Clerk-defined experimental fields describe Poppy protocol identity and may change while Poppy is draft. They are not top-level auth fields. Signed-out protocol identity is not exposed through the auth object and does not populate `agent`, including beside an independent human login.
