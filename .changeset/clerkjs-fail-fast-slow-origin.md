---
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Fail fast when the Clerk Frontend API (FAPI) is slow or unreachable during load. The client request and the load-recovery token mint are now bounded by a timeout, and the timed-out client request is aborted instead of being left in flight. A cold `Clerk.load()` renders identity from a freshly minted session token (falling back to the session cookie if the mint fails) in seconds instead of hanging while retries run. After a degraded load, the client is re-fetched in the background without a time limit, so a slow-but-healthy origin recovers full client data (user profile, other sessions) without a reload. Also fixes hooks like `useUser()` keeping the cookie-derived stub user after full user data arrives. Adds a `timeLimit` utility to `@clerk/shared/utils` that optionally aborts an `AbortController` on timeout.
