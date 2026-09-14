---
'@clerk/nextjs': patch
---

Add a note to the `ClerkProvider`, `clerkMiddleware()` and `auth()` doc comments explaining that `npx clerk@latest init` can provision temporary development keys without a Clerk account. Update the README prerequisites and installation section to say the same, replacing the statement that an existing Clerk application and account are required.
