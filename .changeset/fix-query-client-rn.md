---
"@clerk/clerk-js": patch
---

Fix `useOrganizationList` and other query-based hooks returning empty data on React Native by statically importing `QueryClient` in the native bundle entry point
