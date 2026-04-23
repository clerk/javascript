---
"@clerk/clerk-js": patch
---

Fix `useOrganizationList` and other query-based hooks returning empty data on React Native by using `dynamicImportMode: 'eager'` in the native rspack build so dynamic imports resolve synchronously
