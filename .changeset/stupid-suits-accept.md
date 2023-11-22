---
'@clerk/types': major
---

Introduces two new props for `<ClerkProvider />`, `push` and `replace`. These props replace the `navigate` prop. Passing both `push` and `replace` will allow Clerk to correctly handle navigations without causing issues with the host application's router.