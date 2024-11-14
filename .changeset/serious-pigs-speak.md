---
"@clerk/clerk-js": patch
"@clerk/shared": patch
---

Protect /tokens requests by requiring a valid captcha token if the request fails with 401
