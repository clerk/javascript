---
'@clerk/nextjs': patch
---

Remove `https://images.clerkstage.dev` from the default `connect-src` Content Security Policy directive. It is a Clerk-internal storage host that no application connects to. Organization logos are served from `https://img.clerk.com`, which stays in the default.
