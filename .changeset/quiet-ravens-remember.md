---
'@clerk/expo': patch
---

Fix Expo native Clerk components and JavaScript auth hooks staying stale when authentication changes between the JavaScript and native SDKs. JS-owned sign-in now hydrates native components on cold start, sign-out from either runtime updates the other side, and native multi-session changes keep the remaining JavaScript session active.
