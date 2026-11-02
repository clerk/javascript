'use client';

import { UserProfileConnectedAccountsSection } from '@clerk/mosaic/features/user-profile/user-profile-connected-accounts-section/user-profile-connected-accounts-section';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

import { LivePageHeader } from '../../../live-page-header';

export default function ConnectedAccountsLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='Connected accounts'>
          Connects, reconnects, and removes the signed-in user&apos;s social accounts. The section stays hidden when no
          social provider is enabled.
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
            to manage connected accounts.
          </p>
        ) : null}
        {isLoaded && isSignedIn ? <UserProfileConnectedAccountsSection /> : null}
      </div>
    </MosaicProvider>
  );
}
