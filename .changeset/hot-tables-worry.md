---
"@clerk/backend": minor
---

Adds machine-to-machine endpoints to the Backend SDK:

### Create M2M Tokens

A machine secret is required when creating M2M tokens.

```ts
const clerkClient = createClerkClient({
    machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY
})

clerkClient.machineTokens.create({
    // or pass as an option here
    // machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY
    secondsUntilExpiration: 3600,
})
```

### Revoke M2M Tokens

You can revoke tokens using either a machine secret or instance secret:

```ts
// Using machine secret
const clerkClient = createClerkClient({ machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY })
clerkClient.machineTokens.revoke({
    // or pass as an option here
    // machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY
    m2mTokenId: 'mt_xxxxx',
    revocationReason: 'Revoked by user',
})

// Using instance secret (default)
const clerkClient = createClerkClient({ secretKey: 'sk_xxxx' })
clerkClient.machineTokens.revoke({
    m2mTokenId: 'mt_xxxxx',
    revocationReason: 'Revoked by user',
})
```

### Verify M2M Tokens

You can verify tokens using either a machine secret or instance secret:

```ts
// Using machine secret
const clerkClient = createClerkClient({ machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY })
clerkClient.machineTokens.verifySecret({
    // or pass as an option here
    // machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY
    secret: 'mt_secret_xxxxx',
})

// Using instance secret (default)
const clerkClient = createClerkClient({ secretKey: 'sk_xxxx' })
clerkClient.machineTokens.verifySecret({
    secret: 'mt_secret_xxxxx',
})
```

To verify machine-to-machine tokens using when using `authenticateRequest()` with a machine secret, use the `machineSecret` option:

```ts
const clerkClient = createClerkClient({
    machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY
})

const authReq = await clerkClient.authenticateRequest(c.req.raw, {
  // or pass as an option here
  // machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY
  acceptsToken: 'machine_token',
})

if (authReq.isAuthenticated) {
    // ... do something
}
```