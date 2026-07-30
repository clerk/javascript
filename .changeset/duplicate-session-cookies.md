---
'@clerk/clerk-js': patch
---

Recover from partitioned-cookie startup races by removing stale non-partitioned cookies when partitioned cookies become available.
