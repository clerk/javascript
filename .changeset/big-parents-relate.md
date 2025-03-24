---
'@clerk/tanstack-react-start': minor
---

The TanStack React Start SDK package name is now `@clerk/tanstack-react-start`, previously `@clerk/tanstack-start`. This change aligns our package naming with TanStack Start's conventions.

Please update your imports as follows:

```diff
- import { ClerkProvider } from '@clerk/tanstack-start'
+ import { ClerkProvider } from '@clerk/tanstack-react-start'
```