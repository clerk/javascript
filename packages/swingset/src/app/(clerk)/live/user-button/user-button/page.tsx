'use client';

import { UserButton } from '@clerk/mosaic/features/user-button/user-button';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function UserButtonLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider experimental={{ newProfiles: true }}>
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 p-3 sm:p-8'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-semibold'>User button</h1>
          <p className='text-muted-foreground text-sm'>
            The connected user button, with the signed-in account, its organizations, and the profiles it opens.
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
        <div className='flex flex-wrap items-center gap-4'>
          <UserButton />
          <UserButton combined={false} />
        </div>
      </div>
    </MosaicProvider>
  );
}
