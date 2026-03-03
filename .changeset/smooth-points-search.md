---
"@clerk/backend": patch
---

Allow usage of machine secret key when listing M2M tokens:

```ts
const clerkClient = createClerkClient();

const m2mToken = await clerkClient.m2m.list({
  machineSecretKey: 'ak_xxxxx',
  subject: machineId,
});
```
