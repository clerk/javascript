---
'@clerk/backend': patch
---

Refactor webhook verification to use verification from the `standardwebhooks` package, which is what our underlying provider relies on.
