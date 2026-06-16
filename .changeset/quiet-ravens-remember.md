---
'@clerk/expo': patch
---

Fix Expo native Clerk components and JavaScript auth hooks staying stale when authentication changes between the JavaScript and native SDKs. JS-owned sign-in now hydrates native components on cold start, and sign-out from either JS or native updates the other side.
