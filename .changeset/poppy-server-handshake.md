---
"@clerk/backend": patch
"@clerk/nextjs": patch
---

Publish discovery with `__experimental_poppy: true`. Clerk FAPI hosts the browser join, redeems its ticket server-side, and uses the existing Clerk handshake to set application cookies. Remove the app-domain join proxy and customer callback page.
