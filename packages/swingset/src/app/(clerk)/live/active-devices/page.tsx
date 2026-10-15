'use client';

import { UserProfileActiveDevicesSection } from '@clerk/mosaic/features/user-profile/user-profile-active-devices-section/user-profile-active-devices-section';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

import { LivePageHeader } from '../../live-page-header';

export default function ActiveDevicesLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='Active devices'>Review the devices signed in to your account.</LivePageHeader>
        {!isLoaded ? <p className='text-muted-foreground text-sm'>Loading…</p> : null}
        {isLoaded && !isSignedIn ? (
          <p className='text-muted-foreground text-sm'>
            <Link
              href='/sign-in'
              className='text-foreground underline underline-offset-4'
            >
              Sign in
            </Link>{' '}
            to review your active devices.
          </p>
        ) : null}
        {isLoaded && isSignedIn ? <UserProfileActiveDevicesSection /> : null}
      </div>
    </MosaicProvider>
  );
}
