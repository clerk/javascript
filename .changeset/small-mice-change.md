---
'@clerk/shared': patch
---

Password validation API errors now expose `meta.remainingAttempts`, including when the value is `0`. The API returns it only when an instance enables password confirmation protection, which is off by default.
