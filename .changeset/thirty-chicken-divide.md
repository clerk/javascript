---
'@clerk/nextjs': patch
---

Accept `redirectUrl` as an option for `auth().protect()`.

For example:

```ts
// Authorization
auth().protect({ role:'org:admin' }, { redirectUrl: "/any-page" })
auth().protect({ permission:'org:settings:manage' }, { redirectUrl: "/any-page" })

// Authentication
auth().protect({ redirectUrl: "/any-page" })
```
