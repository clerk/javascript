---
"@clerk/nuxt": patch
"@clerk/tanstack-react-start": patch
---

Allows passing of `treatPendingAsSignedOut` to auth functions:

TanStack Start

```ts
const authStateFn = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getWebRequest()
  const { userId } = await getAuth(request, { treatPendingAsSignedOut: true })

  return { userId }
})
```
Nuxt

```ts
export default eventHandler((event) => {
  const { userId } = event.context.auth({ treatPendingAsSignedOut: true })

  return { userId }
})
```
