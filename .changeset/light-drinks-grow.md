---
'@clerk/nextjs': patch
---

Fix race condition that could cause `__clerkSharedModules is not defined` error when using the shared React UI variant.
