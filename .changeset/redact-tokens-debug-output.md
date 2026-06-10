---
'@clerk/backend': patch
---

Redact raw bearer credentials from the `auth` object's debug output. The debug payload (surfaced when an SDK enables middleware debug logging) previously included full session, machine, refresh, dev-browser and handshake tokens; each now exposes only a short, non-reconstructable prefix, matching how `secretKey` and `jwtKey` are already handled.
