---
"@clerk/backend": minor
---

Add `list()` method to M2M tokens API to retrieve a list of machine-to-machine tokens for a given machine.

```ts
// Retrieve M2M tokens for a specific machine
const response = await clerkClient.m2m.list({
  subject: 'mch_1xxxxxxxxxxxxx',
});

console.log(response.data); // M2MToken[]
console.log(response.totalCount); // number
```

Filter by revoked or expired tokens:

```ts
const revokedTokens = await clerkClient.m2m.list({
  subject: 'mch_1xxxxxxxxxxxxx',
  revoked: true,
});

const expiredTokens = await clerkClient.m2m.list({
  subject: 'mch_1xxxxxxxxxxxxx',
  expired: true,
});
```
