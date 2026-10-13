'use client';

import { OrganizationProfileApiKeysPanel } from '@clerk/mosaic/features/organization-profile/organization-profile-api-keys-panel';
import { UserProfileApiKeysPanel } from '@clerk/mosaic/features/user-profile/user-profile-api-keys-panel';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function ApiKeysLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-semibold'>API keys</h1>
          <p className='text-muted-foreground text-sm'>
            The user and organization profile API keys panels, listing, creating, and revoking real API keys for the
            signed-in user and their active organization. API keys must be enabled for the application.
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
        {isLoaded && isSignedIn ? (
          <>
            <UserProfileApiKeysPanel />
            <OrganizationProfileApiKeysPanel />
          </>
        ) : null}
      </div>
    </MosaicProvider>
  );
}
