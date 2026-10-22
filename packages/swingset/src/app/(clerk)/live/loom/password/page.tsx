import { prefetchProfile } from '@clerk/loom/nextjs';
import { Suspense } from 'react';

import Password from './password';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function PasswordPage() {
  return (
    <Suspense fallback={null}>
      <PrefetchedPassword />
    </Suspense>
  );
}

async function PrefetchedPassword() {
  const prefetch = await prefetchProfile();
  return <Password prefetch={prefetch} />;
}
