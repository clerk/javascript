---
'@clerk/nextjs': patch
---

Add a note to the `ClerkProvider`, `clerkMiddleware()` and `auth()` doc comments explaining that `npx clerk@latest init` creates a Clerk application and writes its keys with no Clerk account or login required. Update the README prerequisites and installation section to say the same, replacing the statement that an existing Clerk application and account are required.
