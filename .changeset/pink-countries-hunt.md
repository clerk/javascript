---
"@clerk/express": patch
"@clerk/fastify": patch
"@clerk/nextjs": patch
"@clerk/nuxt": patch
"@clerk/react-router": patch
"@clerk/remix": patch
"@clerk/tanstack-react-start": patch
---

Add ability to define a machine secret key to Clerk BAPI client function

```ts
const clerkClient = createClerkClient({ machineSecretKey: 'ak_xxxxx' })

clerkClient.machineTokens.create({...})
```
