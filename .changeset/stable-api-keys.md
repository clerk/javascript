---
"@clerk/shared": minor
"@clerk/react": minor
"@clerk/clerk-js": minor
"@clerk/ui": minor
---

Promote API Keys from experimental to stable.

The `<APIKeys />` component and `useAPIKeys()` hook are now generally available.

### `<APIKeys />` component

```tsx
import { APIKeys } from '@clerk/clerk-react';

export default function Page() {
  return <APIKeys />;
}
```

### `useAPIKeys()` hook

```tsx
import { useAPIKeys } from '@clerk/clerk-react';

export default function CustomAPIKeys() {
  const { data, isLoading, page, pageCount, fetchNext, fetchPrevious } = useAPIKeys({
    pageSize: 10,
    initialPage: 1,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {data?.map((key) => (
        <li key={key.id}>{key.name}</li>
      ))}
    </ul>
  );
}
```
