---
'@clerk/localizations': patch
'@clerk/shared': patch
'@clerk/clerk-js': patch
---

Fix API keys "Revoke" confirmation modal being stuck disabled when using a localization. The input label and placeholder now show the localized confirmation text that the user is required to type, instead of being hard-coded to English "Revoke".
