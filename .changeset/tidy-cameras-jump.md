---
'@clerk/nextjs': patch
---

Fix a stray double space in the `getAuth()` "Clerk can't detect usage of clerkMiddleware()" error, so the first bullet renders as `- clerkMiddleware() is used in your Next.js middleware or proxy file.`
