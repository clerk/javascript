---
"@clerk/backend": minor
"@clerk/clerk-js": minor
"@clerk/types": minor
---

Add `createOrganizationsLimit` param in `@clerk/backend` method `User.updateUser()`
Example:

```typescript
    import { createClerkClient }  from '@clerk/backend';

    const clerkClient = createClerkClient({...});
    // Update user with createOrganizationsLimit equals 10
    await clerkClient.users.updateUser('user_...', { createOrganizationsLimit: 10 })

    // Remove createOrganizationsLimit
    await clerkClient.users.updateUser('user_...', { createOrganizationsLimit: 0 })
```
