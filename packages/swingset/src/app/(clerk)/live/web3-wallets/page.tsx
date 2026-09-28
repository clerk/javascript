'use client';

import { UserProfileWeb3WalletsSection } from '@clerk/mosaic/features/user-profile/user-profile-web3-wallets-section/user-profile-web3-wallets-section';
import { MosaicProvider } from '@clerk/mosaic/MosaicProvider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function Web3WalletsLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-semibold'>Web3 wallets</h1>
          <p className='text-muted-foreground text-sm'>
            Connect, verify, and manage the signed-in user&apos;s wallets.
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
            to manage wallets.
          </p>
        ) : null}
        {isLoaded && isSignedIn ? <UserProfileWeb3WalletsSection /> : null}
      </div>
    </MosaicProvider>
  );
}
