---
'@clerk/shared': patch
---

The missing and invalid key errors now say that `npx clerk@latest init` does not need a Clerk account and writes temporary dev keys. Readers previously saw `init` listed beside `link`, `env pull` and the Dashboard link, and assumed signing up was required before any of the steps would work.
