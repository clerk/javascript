---
'@clerk/clerk-js': patch
---

Reverts the changes done https://github.com/clerk/javascript/pull/7105, as it was causing JWT's returned from client piggybacking not get inserted into cache even though their claims have actually changed
