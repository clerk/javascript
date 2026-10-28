---
'@clerk/shared': patch
'@clerk/clerk-js': patch
'@clerk/ui': patch
'@clerk/localizations': patch
---

Support email-link first factors in session reverification. The original tab waits for the link callback, then resumes the protected action without changing the configured authentication strategy.
