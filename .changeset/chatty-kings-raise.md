---
"@clerk/backend": minor
---

Remove `secret` in favor of `token` in m2m response.

Before:

```ts
const result = await clerkClient.m2mTokens.create()

console.log(result.secret)
```

After:

```ts
const result = await clerkClient.m2mTokens.create()

console.log(result.token)
```
