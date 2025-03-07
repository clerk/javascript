---
"@clerk/nuxt": minor
---

Bump `@nuxt/*` dependencies to 3.16.0 and add proper typing for `event.context.auth` object in event handlers

```ts
export default eventHandler((event) => {
  const { userId } = event.context.auth // auth is now typed

  // ...

  return { userId }
})
```
