---
'@clerk/clerk-js': patch
---

Fix token cache stale-while-revalidate timing to use the JWT issued-at time, keeping refresh thresholds accurate when tokens are cached after issuance.
