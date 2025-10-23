<!-- #region nextjs-01 -->

```tsx {{ filename: 'app/page.tsx' }}
'use client';

import { useSessionList } from '@clerk/nextjs';

export default function HomePage() {
  const { isLoaded, sessions } = useSessionList();

  if (!isLoaded) {
    // Handle loading state
    return null;
  }

  return (
    <div>
      <p>Welcome back. You've been here {sessions.length} times before.</p>
    </div>
  );
}
```

<!-- #endregion nextjs-01 -->
