---
'@clerk/express': patch
---

Introduce Express specific Clerk SDK `@clerk/express`. The SDK exposes the following API:

- clerkClient: default @clerk/backend client initialized from env variables and used to make BAPI requests
- clerkMiddleware: centralized middleware that authenticates all requests without blocking them (also triggers handshake mechanism)
- getAuth: utility to retrieve the auth state from the request (requires clerkMiddleware to executed)
- protect: middleware that returns http 401 response when request is signed-out

Also all the top level exports from `@clerk/backend` are re-exported from `@clerk/express` top level.