---
'@clerk/clerk-js': patch
---

Fix a crash in the Turnstile CAPTCHA retry logic where captcha.reset() was called after the widget's DOM container had already been removed, causing an unhandled error
