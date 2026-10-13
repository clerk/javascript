---
'@clerk/nextjs': patch
---

Fix `getAuth()` and `auth()` returning OAuth and M2M tokens as signed-in user sessions. They now return a signed-out state for machine tokens. To authenticate OAuth or M2M tokens on a route, use `auth({ acceptsToken })`.
