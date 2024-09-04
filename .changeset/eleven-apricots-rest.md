---
"@clerk/clerk-js": minor
"@clerk/backend": minor
"@clerk/clerk-react": minor
"@clerk/types": minor
---

Experimental support: Expect a new sessionClaim called `fva` that tracks the age of verified factor groups.

### Server side

This can be applied to any helper that returns the auth object

**Nextjs example**

```ts
auth(). __experimental_factorVerificationAge
```

### Client side

**React example**
```ts
const { session } = useSession()
session?. __experimental_factorVerificationAge
```
