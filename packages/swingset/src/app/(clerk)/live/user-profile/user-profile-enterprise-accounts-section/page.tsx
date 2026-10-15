'use client';

import { UserProfileEnterpriseAccountsSection } from '@clerk/mosaic/features/user-profile/user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function EnterpriseAccountsLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-semibold'>Enterprise accounts</h1>
          <p className='text-muted-foreground text-sm'>
            Connect and view the signed-in user&apos;s enterprise accounts.
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
            to manage enterprise accounts.
          </p>
        ) : null}
        {isLoaded && isSignedIn ? <UserProfileEnterpriseAccountsSection /> : null}
      </div>
    </MosaicProvider>
  );
}
