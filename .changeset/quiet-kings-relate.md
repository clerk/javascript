---
'@clerk/nextjs': patch
---

Using auth().protect inside clerkMiddleware will perform a redirection instead of throwing a not found error when internal navigation in pages router occurs and the user is unauthenticated.
