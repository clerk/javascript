'use client';

import { UserProfileMfaSection } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section/user-profile-mfa-section';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

import { LivePageHeader } from '../../live-page-header';

export default function MfaLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='2-step verification'>
          Manage the verification methods for your signed-in account.
        </LivePageHeader>
        {!isLoaded ? <p className='text-muted-foreground text-sm'>Loading…</p> : null}
        {isLoaded && !isSignedIn ? (
          <p className='text-muted-foreground text-sm'>
            <Link
              href='/sign-in'
              className='text-foreground underline underline-offset-4'
            >
              Sign in
            </Link>{' '}
            to manage your verification methods.
          </p>
        ) : null}
        {isLoaded && isSignedIn ? <UserProfileMfaSection /> : null}
      </div>
    </MosaicProvider>
  );
}
