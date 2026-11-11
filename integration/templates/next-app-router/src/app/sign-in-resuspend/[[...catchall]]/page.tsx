'use client';

import { SignIn } from '@clerk/nextjs';
import React from 'react';

const Lazy = React.lazy(
  () => new Promise<{ default: () => null }>(resolve => setTimeout(() => resolve({ default: () => null }), 50)),
);

export default function Page() {
  const [suspended, setSuspended] = React.useState(false);

  React.useEffect(() => {
    const onResuspend = () => setSuspended(true);
    window.addEventListener('e2e:resuspend', onResuspend);
    return () => window.removeEventListener('e2e:resuspend', onResuspend);
  }, []);

  return (
    <React.Suspense fallback='loading'>
      <SignIn
        routing='path'
        path='/sign-in-resuspend'
        signUpUrl='/sign-up'
      />
      {suspended && <Lazy />}
    </React.Suspense>
  );
}
