---
'@clerk/backend': minor
'@clerk/nextjs': minor
'@clerk/shared': minor
---

Enables server-side options propagation for `clerkMiddleware` to the Next.js application server, allowing access for server-side helpers like `auth`. Options such as `signUpUrl`, `signInUrl`, and `secretKey` are securely encrypted using AES algorithm.

When using `secretKey`, `CLERK_ENCRYPTION_KEY` is required as the encryption key. If `secretKey` is not provided, `CLERK_SECRET_KEY` is used by default.

For more information, refer to the documentation: https://clerk.com/docs/references/nextjs/clerk-middleware#server-side-options-propagation
