---
'@clerk/backend': patch
---

Redact raw session and machine tokens from the `auth` object's debug output. The debug payload (surfaced when an SDK enables middleware debug logging) previously included full bearer tokens; it now exposes only a short, non-reconstructable prefix, matching how `secretKey` and `jwtKey` are already handled.
