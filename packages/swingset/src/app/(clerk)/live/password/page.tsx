'use client';

import { UserProfilePasswordSection } from '@clerk/mosaic/features/user-profile/user-profile-password-section/user-profile-password-section';
import { MosaicProvider } from '@clerk/mosaic/MosaicProvider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function PasswordLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-semibold'>Password</h1>
          <p className='text-muted-foreground text-sm'>Set or change the password for your signed-in account.</p>
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
            to manage your password.
          </p>
        ) : null}
        {isLoaded && isSignedIn ? <UserProfilePasswordSection /> : null}
      </div>
    </MosaicProvider>
  );
}
