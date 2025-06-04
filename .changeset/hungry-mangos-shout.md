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

- Refactored the `verifyWebhook()` function to manually verify a incoming Clerk webhook request. This change removes the need to install the `svix` package. There are no changes to the usage of the function.

If you installed `svix` for the previous versions of `verifyWebhook()` you can uninstall it.

```shell
npm uninstall svix
```
