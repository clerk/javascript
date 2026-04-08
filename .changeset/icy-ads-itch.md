---
'@clerk/nextjs': patch
'@clerk/expo': patch
---

Re-exports `useAPIKeys()` hook.

Usage example:

```tsx
'use client';

import { useAPIKeys } from '@clerk/nextjs';

export default function CustomAPIKeys() {
  const { data, isLoading, page, pageCount, fetchNext, fetchPrevious } = useAPIKeys({
    pageSize: 10,
    initialPage: 1,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {data?.map(key => (
        <li key={key.id}>{key.name}</li>
      ))}
    </ul>
  );
}
```
