---
"@clerk/nuxt": minor
---

Introduce `getAuth()` helper to retrieve authentication state from the event object.

Example:

```ts
export default eventHandler((event) => {
  const { userId } = getAuth(event);

  if (!userId) {
    // User is not authenticated
  }
});
```

