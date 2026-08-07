---
'@clerk/ui': patch
---

Allow self-serve SSO domain verification TXT records to be regenerated while verification is pending. Each successful retry starts a five-minute cooldown, and the remaining time is shown on the disabled retry button.
