import { prefetchProfile } from '@clerk/loom/nextjs';
import { Suspense } from 'react';

import Profile from './profile';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <PrefetchedProfile />
    </Suspense>
  );
}

async function PrefetchedProfile() {
  const prefetch = await prefetchProfile();
  return <Profile prefetch={prefetch} />;
}
