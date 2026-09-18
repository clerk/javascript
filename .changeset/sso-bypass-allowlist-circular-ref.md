---
'@clerk/clerk-js': patch
---

Fix `JSON.stringify` throwing a circular structure error on `Organization` objects. The `ssoBypassAllowlist` helper kept an enumerable reference back to its organization.
