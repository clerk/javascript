---
'@clerk/clerk-js': patch
'@clerk/ui': patch
---

Upgrade build tooling to Rspack 2. No user-facing API changes; the compiled bundle output is produced by Rspack 2's runtime. Also bumps the repo's minimum Node to 22.12.0 (Rspack 2 requirement).
