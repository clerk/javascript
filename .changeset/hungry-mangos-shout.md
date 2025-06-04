---
'@clerk/backend': minor
'@clerk/astro': minor
'@clerk/express': minor
'@clerk/fastify': minor
'@clerk/nextjs': minor
'@clerk/nuxt': minor
'@clerk/react-router': minor
'@clerk/tanstack-react-start': minor
---

The `svix` dependency is no longer needed when using the `verifyWebhook()` function. `verifyWebhook()` was refactored to not rely on `svix` anymore while keeping the same functionality and behavior.

If you previously installed `svix` to use `verifyWebhook()` you can uninstall it now:

```shell
npm uninstall svix
```
