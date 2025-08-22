---
"@clerk/nuxt": patch
"@clerk/tanstack-react-start": patch
---

Allows passing of [`treatPendingAsSignedOut`](https://clerk.com/docs/authentication/configuration/session-tasks#session-handling) to auth functions:

TanStack Start

```ts
const authStateFn = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getWebRequest()
  const { userId } = await getAuth(request, { treatPendingAsSignedOut: false }) // defaults to true

  return { userId }
})
```

Nuxt

```ts
export default eventHandler((event) => {
  const { userId } = event.context.auth({ treatPendingAsSignedOut: false }) // defaults to true

  return { userId }
})
```
