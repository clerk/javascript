---
'@clerk/clerk-js': patch
'@clerk/testing': patch
---

Fix `toBeSignedOut` test-helper so it only resolves when `user === null`. It previously resolved for any falsy value, which could give false positives when Clerk had not loaded yet, or during auth-state changes.
