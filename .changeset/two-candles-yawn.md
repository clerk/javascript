---
'@clerk/clerk-js': patch
---

Reverts the changes introduced in [PR #7105](https://github.com/clerk/javascript/pull/7105), as it was causing JWTs returned from client piggybacking not to be inserted into the cache even though their claims had actually changed.
