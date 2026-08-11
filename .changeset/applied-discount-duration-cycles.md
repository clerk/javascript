---
'@clerk/shared': patch
'@clerk/clerk-js': patch
'@clerk/backend': patch
'@clerk/ui': patch
---

Billing applied-discount snapshots now include optional `durationInCycles`. Payment attempt and statement UIs use the original discount length instead of cycles remaining, and omit the duration copy when it is unavailable.
