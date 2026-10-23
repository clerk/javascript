import { prefetchProfile } from '@clerk/loom/nextjs';

import Profile from './profile';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ prefetch?: string }> }) {
  const params = await searchParams;
  if (params.prefetch === 'off') {
    return <Profile />;
  }
  const prefetch = await prefetchProfile();
  return <Profile prefetch={prefetch} />;
}
