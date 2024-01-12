---
'@clerk/clerk-js': minor
'@clerk/clerk-react': minor
'@clerk/types': minor
---

Remove MembershipRole. The type `MembershipRole` would always include the old role keys `admin`, `basic_member`, `guest_member`. 
If developers still depend on them after the introduction of custom roles, the can provide them as their custom types for authorization.

```ts
// clerk.d.ts
interface ClerkAuthorization {
  permission: '';
  role: 'admin' | 'basic_member' | 'guest_member';
}
```
