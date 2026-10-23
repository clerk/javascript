'use client';

import type { PrefetchedProfile } from '@clerk/loom';
import { LoomProvider } from '@clerk/loom/handoff';
import { LoomPassword } from '@clerk/mosaic/experimental/loom/loom-account-status';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useClerk, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function Password({ prefetch }: { prefetch?: PrefetchedProfile }) {
  const clerk = useClerk();
  const { isLoaded, isSignedIn } = useUser();
  if (isLoaded && !isSignedIn) {
    return (
      <p>
        <Link
          className='underline'
          href='/sign-in'
        >
          Sign in
        </Link>{' '}
        to view your profile.
      </p>
    );
  }
  return (
    <MosaicProvider>
      <LoomProvider
        clerk={clerk}
        prefetch={prefetch}
      >
        <LoomPassword />
      </LoomProvider>
    </MosaicProvider>
  );
}
