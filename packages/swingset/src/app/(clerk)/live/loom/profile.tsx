'use client';

import type { PrefetchedProfile } from '@clerk/loom';
import { LoomProvider } from '@clerk/loom/handoff';
import { LoomComposedProfile } from '@clerk/mosaic/experimental/loom/loom-composed-profile';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useClerk, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function Profile({ prefetch }: { prefetch?: PrefetchedProfile }) {
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
        <LoomComposedProfile />
      </LoomProvider>
    </MosaicProvider>
  );
}
