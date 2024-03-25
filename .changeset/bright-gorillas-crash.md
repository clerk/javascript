---
'@clerk/express': patch
---

Introduce [Express](https://expressjs.com/) specific Clerk SDK called `@clerk/express`. The SDK exposes the following APIs:

- `clerkClient`: Default [`@clerk/backend`](https://clerk.com/docs/references/backend/overview) client initialized from environment variables and used to make backend API requests
- `clerkMiddleware`: Centralized middleware that authenticates all requests without blocking them (also triggers handshake mechanism)
- `getAuth`: Utility to retrieve the auth state from a request (requires `clerkMiddleware` to be executed)
- `requireAuth`: Middleware that returns HTTP 401 response when request is signed-out

Also all the top level exports from `@clerk/backend` are re-exported from `@clerk/express`.