---
'@clerk/clerk-js': patch
---

Fix an issue where `fallbackRedirectUrl` and `forceRedirectUrl` were being improperly passed from sign up to sign in and vice versa. These props will now only apply to the specific flow they were passed to initially.
