<!-- #region nextjs-01 -->

```tsx {{ filename: 'app/sign-in/page.tsx' }}
'use client';

import { useSignIn } from '@clerk/nextjs/legacy';

export default function SignInPage() {
  const { isLoaded, signIn } = useSignIn();

  if (!isLoaded) {
    // Handle loading state
    return null;
  }

  return <div>The current sign-in attempt status is {signIn?.status}.</div>;
}
```

<!-- #endregion nextjs-01 -->
