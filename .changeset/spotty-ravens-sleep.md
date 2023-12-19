---
'@clerk/backend': minor
---

Add `createOrganizationEnabled` param in `@clerk/backend` method `User.updateUser()`
Example:
```typescript
    import { createClerkClient }  from '@clerk/backend';

    const clerkClient = createClerkClient({...});
    await clerkClient.users.updateUser('user_...', { createOrganizationEnabled: true })
```