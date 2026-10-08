---
"@clerk/ui": patch
---

Prevent duplicate authenticator setup requests. Ignore TOTP setup results after an account change or step closure, including during the verification success delay.
