---
"@clerk/clerk-js": patch
"@clerk/ui": patch
---

Guard against empty social provider strategies from FAPI to prevent crashes in `useEnabledThirdPartyProviders`
