<!-- #region nextjs-01 -->

```tsx {{ filename: 'app/page.tsx' }}
'use client';

import { useSession } from '@clerk/nextjs';

export default function HomePage() {
  const { isLoaded, session, isSignedIn } = useSession();

  if (!isLoaded) {
    // Handle loading state
    return null;
  }
  if (!isSignedIn) {
    // Handle signed out state
    return null;
  }

  return (
    <div>
      <p>This session has been active since {session.lastActiveAt.toLocaleString()}</p>
    </div>
  );
}
```

<!-- #endregion nextjs-01 -->
