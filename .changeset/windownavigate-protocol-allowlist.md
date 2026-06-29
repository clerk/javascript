---
'@clerk/clerk-js': patch
'@clerk/react': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Fix missing redirect URL protocol validation for Clerk UI browser navigations, including the multi-session add-account flow.

Internal browser navigations now consistently honor configured redirect protocols and fail closed across mixed ClerkJS/UI bundle versions.
