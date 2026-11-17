'use client';

import { UserProfileDangerSection } from '@clerk/mosaic/features/user-profile/user-profile-danger-section/user-profile-danger-section';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

import { LivePageHeader } from '../../../live-page-header';

export default function DeleteAccountLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='Delete account'>
          Deletes the signed-in account. The section stays hidden when the instance does not allow it.
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
            to delete this account.
          </p>
        ) : null}
        {isLoaded && isSignedIn ? <UserProfileDangerSection /> : null}
      </div>
    </MosaicProvider>
  );
}
