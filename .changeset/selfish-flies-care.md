---
'@clerk/clerk-js': minor
'@clerk/clerk-react': minor
'@clerk/types': minor
---

Update `@clerk/clerk-js` and `@clerk/clerk-react` to support the following examples:

```typescript
Clerk.signOut({ redirectUrl: '/' })

<SignOutButton redirectUrl='/' />
// uses Clerk.signOut({ redirectUrl: '/' })
<UserButton afterSignOutUrl='/after' />
// uses Clerk.signOut({ redirectUrl: '/after' })
<ClerkProvider afterSignOutUrl='/after' />
// uses Clerk.signOut({ redirectUrl: '/after' })
```