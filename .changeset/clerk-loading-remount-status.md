---
'@clerk/react': patch
---

Fix `<ClerkLoading>` staying rendered and `<ClerkLoaded>` never rendering when a `<ClerkProvider>` remounts after Clerk has already loaded, for example after navigating away from and back to a layout that contains it.
