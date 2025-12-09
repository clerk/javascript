---
"@clerk/backend": minor
---

Added API keys `get`, `delete` and `update` methods.

Usage:

```ts
await clerkClient.apiKeys.get('api_key_id')

await clerkClient.apiKeys.update({
  apiKeyId: 'api_key_id',
  scopes: ['scope1', 'scope2']
})

await clerkClient.apiKeys.delete('api_key_id')
```
