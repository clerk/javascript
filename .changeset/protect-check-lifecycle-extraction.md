---
'@clerk/shared': patch
---

Extract the Protect check lifecycle helpers (`executeProtectCheckWithTimeout`, `submitProtectCheckProof`) into the internal `@clerk/shared/internal/clerk-js/protectCheckLifecycle` module. Internal refactor; no public API changes.
