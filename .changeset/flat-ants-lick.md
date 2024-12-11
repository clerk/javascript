---
'@clerk/react-router': minor
---

Remove need to pass `loaderData` to `<ClerkProvider>`.

Before:

```tsx
<ClerkProvider loaderData={loaderData}>
```

After:

```tsx
<ClerkProvider>
```

The data is now received internally through a `useLoaderData()` hook.
