---
'@clerk/backend': minor
'@clerk/nextjs': minor
---

Introduces dynamic keys from `clerkMiddleware`, allowing access by server-side helpers like `auth`. Keys such as `signUpUrl`, `signInUrl`, `publishableKey` and `secretKey` are securely encrypted using AES algorithm.

- When providing `secretKey`, `CLERK_ENCRYPTION_KEY` is required as the encryption key. If `secretKey` is not provided, `CLERK_SECRET_KEY` is used by default.
- `clerkClient` from `@clerk/nextjs` should now be called as a function, and its singleton form is deprecated. This change allows the Clerk backend client to read keys from the current request, which is necessary to support dynamic keys.

For more information, refer to the documentation: https://clerk.com/docs/references/nextjs/clerk-middleware#dynamic-keys
