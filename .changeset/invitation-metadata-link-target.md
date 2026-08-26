---
'@clerk/backend': patch
'@clerk/nextjs': patch
---

Align JSDoc link targets with the docs link rules: internal docs links don't open in a new tab (removed `{{ target: '_blank' }}` from the `Invitation` Metadata link), while API reference links do (added it to the `ExternalAccount` Backend API link and the `currentUser()` endpoint link).
