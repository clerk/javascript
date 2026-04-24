---
'@clerk/shared': patch
---

Fix `useOrganizationList` and `useOrganization` briefly reporting paginated resources as `isLoading: false` with empty data before the query starts.
