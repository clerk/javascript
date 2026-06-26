---
'@clerk/clerk-js': patch
---

Apply session tokens monotonically by origin-issued-at on a single tab, so a stale edge-minted token can no longer overwrite a fresher one in the `__session` cookie, the session's last active token, or the token cache.
