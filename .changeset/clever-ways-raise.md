---
"@clerk/backend": minor
"@clerk/nextjs": minor
---

Added support for JWT token format when creating and verifying machine-to-machine (M2M) tokens. This enables fully **networkless verification** when using the public JWT key.

**Creating a JWT-format M2M token**

```ts
const clerkClient = createClerkClient({
  machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY
})

const m2mToken = await clerkClient.m2m.createToken({
  tokenFormat: 'jwt',
})

console.log('M2M token created:', m2mToken.token)
```

**Verifying a token**

```ts
const clerkClient = createClerkClient({
  machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY
})

const authHeader = req.headers.get('Authorization')
const token = authHeader.slice(7)

const verified = await clerkClient.m2m.verify(token)

console.log('Verified M2M token:', verified)
```

**Networkless verification**

```ts
const clerkClient = createClerkClient({
  jwtKey: process.env.CLERK_JWT_KEY
})

const authHeader = req.headers.get('Authorization')
const token = authHeader.slice(7)

const verified = await clerkClient.m2m.verify(token)

console.log('Verified M2M token:', verified)
```
