---
'@clerk/clerk-js': patch
---

Fix a bug where client_uat domain detection would not handle hostnames with a single part. This impacts locally defined custom hostnames used as aliases.
