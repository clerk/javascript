'use client';

import { Profile } from '@clerk/mosaic/features/profile/profile';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

import { LivePageHeader } from '../../../live-page-header';

export default function ProfileLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='Profile'>
          The connected profile: the signed-in account&apos;s pages, then the active organization&apos;s.
        </LivePageHeader>
        {isLoaded && !isSignedIn ? (
          <p className='text-muted-foreground text-sm'>
            <Link
              href='/sign-in'
              className='text-foreground underline underline-offset-4'
            >
              Sign in
            </Link>{' '}
            to use the live harness.
          </p>
        ) : null}
        <Profile fallback={<p className='text-muted-foreground text-sm'>Loading…</p>} />
      </div>
    </MosaicProvider>
  );
}
