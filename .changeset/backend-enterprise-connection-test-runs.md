---
'@clerk/backend': minor
---

Add `createEnterpriseConnectionTestRun()` and `getEnterpriseConnectionTestRunList()` to `clerkClient.enterpriseConnections` for testing a SAML or OIDC enterprise connection against its Identity Provider (IdP). `createEnterpriseConnectionTestRun()` returns a short-lived `url` that starts a test sign-in. `getEnterpriseConnectionTestRunList()` returns the connection's test runs as `EnterpriseConnectionTestRun` objects, with each run's status, the user information parsed from the IdP and its log entries, and accepts a `status` filter plus `limit` and `offset`. `EnterpriseConnectionTestRun` and its related types are exported from `@clerk/backend`.

```ts
const { url } = await clerkClient.enterpriseConnections.createEnterpriseConnectionTestRun('entconn_123');

const { data } = await clerkClient.enterpriseConnections.getEnterpriseConnectionTestRunList('entconn_123', {
  status: ['failed'],
});
```
