---
'@clerk/clerk-js': patch
---

Restore the `clerk.__internal_queryClient` getter as a backward-compatibility shim so apps still on `@clerk/shared < 4.10.0` can hydrate their query client and continue to render paginated hooks (e.g. `useOrganizationList`, `useOrganization`). The getter lazily imports `@tanstack/query-core` only when accessed, so apps on `@clerk/shared >= 4.10.0` (which use the singleton in `@clerk/shared`) pay zero runtime cost.
