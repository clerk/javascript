---
"@clerk/backend": minor
---

Adds machine-to-machine endpoints to the Backend SDK:

**Note:** Renamed from "machine_tokens" to "m2m_tokens" for clarity and consistency with canonical terminology. This avoids confusion with other machine-related concepts like machine secrets.

### Create M2M Tokens

A machine secret is required when creating M2M tokens.

```ts
const clerkClient = createClerkClient({
    machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY
})

clerkClient.m2mTokens.create({
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
clerkClient.m2mTokens.revoke({
    // or pass as an option here
    // machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY
    m2mTokenId: 'mt_xxxxx',
    revocationReason: 'Revoked by user',
})

// Using instance secret (default)
const clerkClient = createClerkClient({ secretKey: 'sk_xxxx' })
clerkClient.m2mTokens.revoke({
    m2mTokenId: 'mt_xxxxx',
    revocationReason: 'Revoked by user',
})
```

### Verify M2M Tokens

You can verify tokens using either a machine secret or instance secret:

```ts
// Using machine secret
const clerkClient = createClerkClient({ machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY })
clerkClient.m2mTokens.verifySecret({
    // or pass as an option here
    // machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY
    secret: 'mt_secret_xxxxx',
})

// Using instance secret (default)
const clerkClient = createClerkClient({ secretKey: 'sk_xxxx' })
clerkClient.m2mTokens.verifySecret({
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
  acceptsToken: 'm2m_token', // previously machine_token
})

if (authReq.isAuthenticated) {
    // ... do something
}
```
