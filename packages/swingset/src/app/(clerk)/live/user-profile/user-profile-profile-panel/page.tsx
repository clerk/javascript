'use client';

import { UserProfileProfilePanel } from '@clerk/mosaic/features/user-profile/user-profile-profile-panel';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function AccountLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-semibold'>Account</h1>
          <p className='text-muted-foreground text-sm'>
            The user profile account panel, with every live section the signed-in account has enabled.
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
            to use the live harness.
          </p>
        ) : null}
        {isLoaded && isSignedIn ? <UserProfileProfilePanel /> : null}
      </div>
    </MosaicProvider>
  );
}
