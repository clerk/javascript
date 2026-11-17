'use client';

import { UserProfilePasskeysSection } from '@clerk/mosaic/features/user-profile/user-profile-passkeys-section/user-profile-passkeys-section';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

import { LivePageHeader } from '../../../live-page-header';

export default function PasskeysLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='Passkeys'>Manage passkeys for the signed-in user.</LivePageHeader>
        {!isLoaded ? <p className='text-muted-foreground text-sm'>Loading…</p> : null}
        {isLoaded && !isSignedIn ? (
          <p className='text-muted-foreground text-sm'>
            <Link
              href='/sign-in'
              className='text-foreground underline underline-offset-4'
            >
              Sign in
            </Link>{' '}
            to manage passkeys.
          </p>
        ) : null}
        {isLoaded && isSignedIn ? <UserProfilePasskeysSection /> : null}
      </div>
    </MosaicProvider>
  );
}
