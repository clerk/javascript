---
'@clerk/clerk-js': patch
---

Fix dev browser token being read from a stale non-partitioned cookie when `partitionedCookies` is enabled. The token is now kept in memory so FAPI requests always use the authoritative value.
