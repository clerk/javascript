'use client';

import { UserProfile } from '@clerk/mosaic/features/user-profile/user-profile';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function UserProfileLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 p-3 sm:p-8'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-semibold'>User profile</h1>
          <p className='text-muted-foreground text-sm'>
            The connected user profile, with the account, security, and API keys pages for the signed-in account.
          </p>
        </div>
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
        <UserProfile fallback={<p className='text-muted-foreground text-sm'>Loading…</p>} />
      </div>
    </MosaicProvider>
  );
}
