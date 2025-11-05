---
"@clerk/backend": minor
---

Fixed API keys `list` method return type

```ts
const apiKeys = await clerkClient.apiKeys.list({ subject: 'user_xxxxx' })

apiKeys.data
apiKeys.totalCount
```
