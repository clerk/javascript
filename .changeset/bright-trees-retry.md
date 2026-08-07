---
'@clerk/ui': patch
'@clerk/localizations': patch
'@clerk/shared': patch
---

Allow self-serve SSO domain verification TXT records to be regenerated while verification is pending. Each successful retry starts a five-minute cooldown, explained on the disabled retry button.
