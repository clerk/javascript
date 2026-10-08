---
'@clerk/ui': patch
---

Prevent duplicate authenticator setup requests and ignore old setup or verification results after the account or setup screen changes.

Keep profile requests active during React StrictMode effect replay so that current setup errors remain visible.
