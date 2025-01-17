---
'@clerk/nextjs': patch
---

Bug fix: Running `build` with on Keyless mode should not prevent `<ClerkProvider/>` throwing an error for missing publishable key.
