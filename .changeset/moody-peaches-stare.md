---
'@clerk/nextjs': major
---

Throw an error when an encryption key is missing when passing a secret key at runtime `clerkMiddleware()`. To migrate, ensure your application specifies a `CLERK_ENCRYPTION_KEY` environment variable when passing `secretKey` as a runtime option.
