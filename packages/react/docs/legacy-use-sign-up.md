<!-- #region nextjs-01 -->

```tsx {{ filename: 'app/sign-up/page.tsx' }}
'use client';

import { useSignUp } from '@clerk/nextjs/legacy';

export default function SignUpPage() {
  const { isLoaded, signUp } = useSignUp();

  if (!isLoaded) {
    // Handle loading state
    return null;
  }

  return <div>The current sign-up attempt status is {signUp?.status}.</div>;
}
```

<!-- #endregion nextjs-01 -->
