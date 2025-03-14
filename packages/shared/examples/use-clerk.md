<!-- #region nextjs-01 -->

```tsx {{ filename: 'app/page.tsx' }}
'use client';

import { useClerk } from '@clerk/nextjs';

export default function HomePage() {
  const clerk = useClerk();

  return <button onClick={() => clerk.openSignIn({})}>Sign in</button>;
}
```

<!-- #endregion nextjs-01 -->
