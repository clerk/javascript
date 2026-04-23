---
'@clerk/shared': patch
---

Fix `useOrganizationList` and `useOrganization` returning `isLoaded: true` with `userMemberships.isLoading: false` and `data: []` during the brief window between clerk-js loading and the React Query client attaching. `useBaseQuery` now reports `isLoading: true` while the query client is not yet loaded, as long as the query is enabled — restoring the documented `!isLoaded || resource.isLoading` loading gate for paginated resources.
