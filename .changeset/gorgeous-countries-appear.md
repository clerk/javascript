---
'@clerk/nextjs': patch
---

Update `<ClerkProvider />` to work in client components within the app router. This allows rendering of the provider in client components, previously the pages router provider was being imported and throwing an error.
