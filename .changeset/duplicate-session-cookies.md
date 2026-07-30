---
'@clerk/backend': patch
'@clerk/clerk-js': patch
---

Recover from partitioned-cookie startup races and prefer fresh session tokens when duplicate session cookies are present.
