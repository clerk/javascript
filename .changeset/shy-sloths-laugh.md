---
"@clerk/clerk-js": minor
---

We recently shipped an experimental feature to persist the Clerk client (under `persistClient` flag) as an opt-in. This allows for matching a user's device with a client. We want to test this behavior with more users, so we're making it opt-out as the next step. After more successful testing we'll remove the experimental flag and enable it by default.

If you're encountering issues, please open an issue. You can disable this new behavior like so:

```js
// React
<ClerkProvider experimental={{ persistClient: false }} />

// Vanilla JS
await clerk.load({ experimental: { persistClient: false } })
```

