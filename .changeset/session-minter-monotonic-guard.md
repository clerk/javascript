---
'@clerk/clerk-js': patch
---

Add monotonic token replacement based on `oiat` to prevent edge-minted tokens with stale claims from overwriting fresher DB-minted tokens in multi-tab scenarios.
