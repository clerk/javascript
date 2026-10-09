'use client';

import { UserProfilePhoneSection } from '@clerk/mosaic/features/user-profile/user-profile-phone-section/user-profile-phone-section';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function PhoneLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-semibold'>Phone</h1>
          <p className='text-muted-foreground text-sm'>
            Add, verify, and remove the phone numbers of the signed-in account.
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
        {isLoaded && isSignedIn ? <UserProfilePhoneSection /> : null}
      </div>
    </MosaicProvider>
  );
}
