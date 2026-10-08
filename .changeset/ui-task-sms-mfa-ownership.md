---
"@clerk/ui": patch
---

Prevent duplicate SMS MFA setup requests. Ignore results from closed steps or changed accounts, and keep the phone form disabled until its request completes.
