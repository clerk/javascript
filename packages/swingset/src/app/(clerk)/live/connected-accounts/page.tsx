'use client';

import { UserProfileConnectedAccountsSection } from '@clerk/mosaic/features/user-profile/user-profile-connected-accounts-section/user-profile-connected-accounts-section';
import { MosaicProvider } from '@clerk/mosaic/MosaicProvider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function ConnectedAccountsLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-semibold'>Connected accounts</h1>
          <p className='text-muted-foreground text-sm'>
            Connects, reconnects, and removes the signed-in user&apos;s social accounts. The section stays hidden when
            no social provider is enabled.
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
            to manage connected accounts.
          </p>
        ) : null}
        {isLoaded && isSignedIn ? <UserProfileConnectedAccountsSection /> : null}
      </div>
    </MosaicProvider>
  );
}
