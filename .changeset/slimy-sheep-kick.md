---
"@clerk/nuxt": major
---

Removed deprecated `getAuth()` helper. Use `event.context.auth()` in your server routes instead.

```ts
export default defineEventHandler((event) => {
  const { userId } = event.context.auth()

  return {
    userId,
  }
})
```
