'use client';

import { UserProfileDeleteSection } from '@clerk/mosaic/features/user-profile/user-profile-delete-section/user-profile-delete-section';
import { MosaicProvider } from '@clerk/mosaic/MosaicProvider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function DeleteAccountLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-semibold'>Delete account</h1>
          <p className='text-muted-foreground text-sm'>
            Deletes the signed-in account. The section stays hidden when the instance does not allow it.
          </p>
        </div>
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
        {isLoaded && isSignedIn ? <UserProfileDeleteSection /> : null}
      </div>
    </MosaicProvider>
  );
}
