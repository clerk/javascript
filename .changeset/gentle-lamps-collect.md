---
"@clerk/backend": patch
---

Added missing `orderBy` field to machines list method

Example:

```ts
clerkClient.machines.list({
  ...,
  orderBy: 'name'
})
```
