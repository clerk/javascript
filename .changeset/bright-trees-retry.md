---
'@clerk/ui': patch
'@clerk/localizations': patch
'@clerk/shared': patch
---

Add a "Re-issue" action to pending self-serve SSO domains, which issues a fresh TXT record when the published one is stale. Each successful re-issue starts a five-minute cooldown, explained on the disabled button.
