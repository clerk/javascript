---
'@clerk/shared': minor
'@clerk/astro': patch
'@clerk/backend': patch
'@clerk/chrome-extension': patch
'@clerk/clerk-js': patch
'@clerk/themes': patch
'@clerk/vue': patch
---

Deprecate `@clerk/types` in favor of `@clerk/shared/types`

The `@clerk/types` package is now deprecated. All type definitions have been consolidated and moved to `@clerk/shared/types` to improve consistency across the Clerk ecosystem.

**Backward Compatibility:**

The `@clerk/types` package will remain available and will continue to re-export all types from `@clerk/shared/types` to ensure backward compatibility. Existing applications will continue to work without any immediate breaking changes. However, we strongly recommend migrating to `@clerk/shared/types` as new type definitions and updates will only be added to `@clerk/shared/types` starting with the next major release.

**Migration Steps:**

Please update your imports from `@clerk/types` to `@clerk/shared/types`:

```typescript
// Before
import type { ClerkResource, UserResource } from '@clerk/types';

// After
import type { ClerkResource, UserResource } from '@clerk/shared/types';
```

**What Changed:**

All type definitions including:
- Resource types (User, Organization, Session, etc.)
- API response types
- Configuration types  
- Authentication types
- Error types
- And all other shared types

Have been moved from `packages/types/src` to `packages/shared/src/types` and are now exported via `@clerk/shared/types`.

