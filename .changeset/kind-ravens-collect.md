---
"@clerk/backend": patch
---

Support `min_remaining_ttl_seconds` for M2M token creation.

Usage:

```ts
clerkClient.m2m.createToken({
  machineSecretKey: 'ak_xxxxx',
  minRemainingTtlSeconds: 240,
})
```
