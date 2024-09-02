---
"@clerk/types": minor
"@clerk/clerk-js": minor
---

**Experimental:** Persist the Clerk client after signing out a user.
This allows for matching a user's device with a client. To try out this new feature, enable it in your `<ClerkProvider />` or `clerk.load()` call.

```js
// React
<ClerkProvider  experimental={{ persistClient: true }} />

// Vanilla JS
await clerk.load({ experimental: { persistClient: true } })
```

Afterwards you can access `clerk.client.id` and `clerk.client.lastActiveSessionId`
