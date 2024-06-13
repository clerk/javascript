---
'@clerk/backend': minor
'@clerk/nextjs': minor
'@clerk/shared': minor
---

Propagate Next.js middleware options to the application server, solving the following issues:
- `auth` couldn't assert the session token signature due to not having access to `secretKey` passed as an option.
- `auth.redirectToSignIn` doesn't redirect to `signInUrl` provided as option.

`CLERK_ENCRYPTION_KEY` must be defined when providing `secretKey` as an option, in order to securely propagated this value
between servers. For more information regarding options propagation, refer to (TODO - Add docs URL here)
