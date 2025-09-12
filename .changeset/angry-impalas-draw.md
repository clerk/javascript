---
"@clerk/backend": patch
---

Add machine secret key rotation BAPI method

Usage:

```ts
clerkClient.machines.rotateSecretKey({
  machineId: 'mch_xxx',
  previousTokenTtl: 3600,
})
```
